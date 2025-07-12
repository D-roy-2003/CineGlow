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

export async function fetchMovieDetailsTMDb(title: string): Promise<{
  title: string;
  year: string;
  rating: number;
  type: string;
  poster: string;
}> {
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) return { title, year: '', rating: 0, type: '', poster: '' };
  // Search both movies and TV shows
  const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(title)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      return { title, year: '', rating: 0, type: '', poster: '' };
    }
    // Find the best match (first result)
    const result = data.results[0];
    let year = '';
    if (result.release_date) year = result.release_date.slice(0, 4);
    else if (result.first_air_date) year = result.first_air_date.slice(0, 4);
    let type = result.media_type === 'tv' ? 'TV' : 'Movie';
    let poster = result.poster_path
      ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
      : '';
    return {
      title: result.title || result.name || title,
      year,
      rating: result.vote_average || 0,
      type,
      poster,
    };
  } catch {
    return { title, year: '', rating: 0, type: '', poster: '' };
  }
}

export async function fetchFeaturedMoviesTMDb(count: number = 10): Promise<Array<{
  id: number;
  title: string;
  year: string;
  genre: string;
  rating: number;
  type: string;
  poster: string;
  description: string;
}>> {
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) return [];
  // Fetch trending movies of the week
  const url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || data.results.length === 0) return [];
    // For each movie, fetch genre names if possible
    // We'll fetch genres from /genre/movie/list
    let genresMap: Record<number, string> = {};
    try {
      const genresRes = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`);
      const genresData = await genresRes.json();
      if (genresData.genres) {
        genresMap = Object.fromEntries(genresData.genres.map((g: any) => [g.id, g.name]));
      }
    } catch {}
    return data.results.slice(0, count).map((movie: any) => ({
      id: movie.id,
      title: movie.title || movie.name || '',
      year: movie.release_date ? movie.release_date.slice(0, 4) : '',
      genre: movie.genre_ids && movie.genre_ids.length > 0 ? genresMap[movie.genre_ids[0]] || '' : '',
      rating: movie.vote_average || 0,
      type: 'Movie',
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
      description: movie.overview || '',
    }));
  } catch {
    return [];
  }
}

export async function fetchTrendingTodayTMDb(count: number = 8): Promise<Array<{
  id: number;
  title: string;
  year: string;
  rating: number;
  type: string;
  poster: string;
  genre: string;
}>> {
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) return [];
  // Fetch trending movies and TV shows for today
  const url = `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || data.results.length === 0) return [];
    // Fetch genres for both movies and TV
    let movieGenres: Record<number, string> = {};
    let tvGenres: Record<number, string> = {};
    try {
      const movieGenresRes = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`);
      const movieGenresData = await movieGenresRes.json();
      if (movieGenresData.genres) {
        movieGenres = Object.fromEntries(movieGenresData.genres.map((g: any) => [g.id, g.name]));
      }
      const tvGenresRes = await fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}`);
      const tvGenresData = await tvGenresRes.json();
      if (tvGenresData.genres) {
        tvGenres = Object.fromEntries(tvGenresData.genres.map((g: any) => [g.id, g.name]));
      }
    } catch {}
    return data.results.slice(0, count).map((item: any) => {
      const isMovie = item.media_type === 'movie';
      const isTV = item.media_type === 'tv';
      let genre = '';
      if (isMovie && item.genre_ids && item.genre_ids.length > 0) {
        genre = movieGenres[item.genre_ids[0]] || '';
      } else if (isTV && item.genre_ids && item.genre_ids.length > 0) {
        genre = tvGenres[item.genre_ids[0]] || '';
      }
      return {
        id: item.id,
        title: item.title || item.name || '',
        year: (item.release_date || item.first_air_date || '').slice(0, 4),
        rating: item.vote_average || 0,
        type: isMovie ? 'Movie' : isTV ? 'TV' : '',
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
        genre,
      };
    });
  } catch {
    return [];
  }
}

export async function fetchTopRatedMoviesTMDb(count: number = 8): Promise<Array<{
  id: number;
  title: string;
  year: string;
  rating: number;
  type: string;
  poster: string;
  genre: string;
}>> {
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) return [];
  const url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || data.results.length === 0) return [];
    let movieGenres: Record<number, string> = {};
    try {
      const genresRes = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`);
      const genresData = await genresRes.json();
      if (genresData.genres) {
        movieGenres = Object.fromEntries(genresData.genres.map((g: any) => [g.id, g.name]));
      }
    } catch {}
    return data.results.slice(0, count).map((item: any) => {
      let genre = '';
      if (item.genre_ids && item.genre_ids.length > 0) {
        genre = movieGenres[item.genre_ids[0]] || '';
      }
      return {
        id: item.id,
        title: item.title || '',
        year: (item.release_date || '').slice(0, 4),
        rating: item.vote_average || 0,
        type: 'Movie',
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
        genre,
      };
    });
  } catch {
    return [];
  }
}

export async function fetchPopularTVShowsTMDb(count: number = 8): Promise<Array<{
  id: number;
  title: string;
  year: string;
  rating: number;
  type: string;
  poster: string;
  genre: string;
}>> {
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) return [];
  const url = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || data.results.length === 0) return [];
    let tvGenres: Record<number, string> = {};
    try {
      const genresRes = await fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}`);
      const genresData = await genresRes.json();
      if (genresData.genres) {
        tvGenres = Object.fromEntries(genresData.genres.map((g: any) => [g.id, g.name]));
      }
    } catch {}
    return data.results.slice(0, count).map((item: any) => {
      let genre = '';
      if (item.genre_ids && item.genre_ids.length > 0) {
        genre = tvGenres[item.genre_ids[0]] || '';
      }
      return {
        id: item.id,
        title: item.name || '',
        year: (item.first_air_date || '').slice(0, 4),
        rating: item.vote_average || 0,
        type: 'TV',
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
        genre,
      };
    });
  } catch {
    return [];
  }
}
