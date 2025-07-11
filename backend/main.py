from fastapi import FastAPI
import pickle
import difflib
import numpy as np
import os
import requests
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] for all origins (not recommended for prod)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load precomputed data
new_df = pickle.load(open('movie_list.pkl', 'rb'))
similarity = pickle.load(open('similarity.pkl', 'rb'))

# Load Gemini API key
load_dotenv(os.path.join(os.path.dirname(__file__), '.env.local'))
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Precompute normalized titles
titles = new_df['title_x'].tolist()
normalized_titles = [name.replace(' ', '_').lower().strip() for name in titles]

# Precompute cast and crew dictionaries
def normalize_name(name):
    return name.replace('_', ' ').lower().strip()

all_cast = set()
all_crew = set()
cast_to_titles = {}
crew_to_titles = {}

# Reconstruct from tags (since we don't have original columns)
for idx, row in new_df.iterrows():
    # Extract cast and crew from tags
    tags_list = row['tags'].split()
    # Assuming last 5 elements are cast and next 1 is crew (based on your preprocessing)
    cast = tags_list[-6:-1] if len(tags_list) >= 6 else []
    crew = tags_list[-1:] if len(tags_list) >= 1 else []
    
    for actor in cast:
        norm_actor = normalize_name(actor)
        all_cast.add(norm_actor)
        if norm_actor not in cast_to_titles:
            cast_to_titles[norm_actor] = []
        cast_to_titles[norm_actor].append(row['title_x'])
    
    for director in crew:
        norm_director = normalize_name(director)
        all_crew.add(norm_director)
        if norm_director not in crew_to_titles:
            crew_to_titles[norm_director] = []
        crew_to_titles[norm_director].append(row['title_x'])

def gemini_recommend(query, n=5):
    if not GEMINI_API_KEY:
        return []
    print("gemini_recommend CALLED with query:", query)
    prompt = f'Generate a list of {n} movies related to "{query}". If "{query}" is a director, actor, or creator, list their most famous movies. If it is a movie, list similar movies. Only return movie titles, no extra explanation.'
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY
    data = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    try:
        resp = requests.post(url, json=data, timeout=10)
        resp.raise_for_status()
        result = resp.json()
        print("Gemini raw response:", result)  # Debug print
        text = None
        # Try all possible response structures
        try:
            # Standard Gemini structure
            text = result['candidates'][0]['content']['parts'][0]['text']
        except Exception as e1:
            print("Gemini response parsing error (parts):", e1)
            try:
                # Sometimes Gemini returns just 'text' or 'content' directly
                text = result['candidates'][0]['content']['text']
            except Exception as e2:
                print("Gemini response parsing error (content):", e2)
                try:
                    text = result['candidates'][0]['text']
                except Exception as e3:
                    print("Gemini response parsing error (text):", e3)
                    text = str(result)
        print("Gemini extracted text:", text)
        lines = [line.strip('- ').strip() for line in text.split('\n') if line.strip()]
        return [line for line in lines if line]
    except Exception as e:
        print("Gemini API error:", e)
        return []

@app.get("/test_gemini")
async def test_gemini(query: str = "Makoto Shinkai", n: int = 5):
    """Test Gemini API connectivity and output."""
    result = gemini_recommend(query, n)
    return {"query": query, "result": result}

@app.get("/")
async def root():
    return {"message": "Movie Recommendation API"}

@app.get("/recommend")
async def recommend(query: str, n: int = 5):
    query_norm = normalize_name(query)
    
    # Check if query matches a movie
    if query_norm in normalized_titles:
        idx = normalized_titles.index(query_norm)
        sim_scores = list(enumerate(similarity[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        movie_indices = [i[0] for i in sim_scores[1:n+1]]
        return {"recommendations": [titles[i] for i in movie_indices]}
    
    # Check if query matches an actor
    if query_norm in all_cast:
        return {
            "type": "cast",
            "name": query.title(),
            "movies": list(set(cast_to_titles[query_norm]))  # Remove duplicates
        }
    
    # Check if query matches a director
    if query_norm in all_crew:
        return {
            "type": "director",
            "name": query.title(),
            "movies": list(set(crew_to_titles[query_norm]))  # Remove duplicates
        }
    
    # Find close matches
    close_titles = difflib.get_close_matches(query_norm, normalized_titles, n=4, cutoff=0.7)
    if close_titles:
        return {"suggestions": [titles[normalized_titles.index(t)] for t in close_titles]}
    
    close_cast = difflib.get_close_matches(query_norm, list(all_cast), n=4, cutoff=0.7)
    if close_cast:
        return {"suggestions": [name.title() for name in close_cast]}
    
    close_crew = difflib.get_close_matches(query_norm, list(all_crew), n=4, cutoff=0.7)
    if close_crew:
        return {"suggestions": [name.title() for name in close_crew]}
    
    # If no results found:
    # Gemini fallback
    gemini_results = gemini_recommend(query, n)
    if gemini_results:
        return {"recommendations": gemini_results, "source": "gemini"}
    return {"message": "No results found (even with Gemini)"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)