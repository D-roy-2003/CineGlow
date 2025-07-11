import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchRecommendations(query: string, n: number = 5): Promise<string[]> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const url = `${backendUrl}/recommend?query=${encodeURIComponent(query)}&n=${n}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.recommendations) return data.recommendations;
  if (data.movies) return data.movies; // for cast/director
  if (data.suggestions) return data.suggestions;
  return [];
}

export async function fetchMovieDetailsGemini(title: string): Promise<{ title: string; year: string; rating: number; type: string }> {
  const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;
  const prompt = `Give me the release year, IMDb rating (out of 10), and type (Movie or TV) for the title: "${title}". Respond in JSON: {\"title\":..., \"year\":..., \"rating\":..., \"type\":...}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await res.json();
  let text = '';
  try {
    text = result.candidates[0].content.parts[0].text;
  } catch {
    text = JSON.stringify(result);
  }
  // Try to parse JSON from Gemini response
  let details = { title, year: '', rating: 0, type: '' };
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      details = { ...details, ...JSON.parse(match[0]) };
    }
  } catch {}
  return details;
}
