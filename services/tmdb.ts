
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = "1df8a1199d8bb144159aba81cef93f21"; 

export interface TMDBShow {
  id: number;
  name: string;
  first_air_date: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  genre_ids?: number[];
  videos?: {
    results: Array<{ key: string; site: string; type: string }>;
  };
  reviews?: {
    results: Array<{ author: string; content: string; id: string }>;
  };
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export async function tmdbSearchTV(query: string): Promise<TMDBShow | null> {
  // Guard clause to prevent invalid API requests
  if (!query || query.trim().length === 0) return null;

  const url = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.results || data.results.length === 0) return null;
    return data.results.sort((a: any, b: any) => b.popularity - a.popularity)[0];
  } catch (error) {
    console.error("TMDB Search Error:", error);
    return null;
  }
}

export async function getTVDetails(id: number): Promise<TMDBShow | null> {
  const url = `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,reviews,external_ids`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("TMDB Detail Error:", error);
    return null;
  }
}

export async function getTopRatedTV(): Promise<TMDBShow[]> {
  const url = `${TMDB_BASE_URL}/tv/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
  } catch (e) { return []; }
}

export async function getPopularTV(): Promise<TMDBShow[]> {
  const url = `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
  } catch (e) { return []; }
}

export async function getGenres(language: string = 'en-US'): Promise<TMDBGenre[]> {
  const url = `${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}&language=${language}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.genres || [];
  } catch (error) {
    console.error("TMDB Genre Error:", error);
    return [];
  }
}

export async function getDiscoverTV(genreId?: number, page: number = 1, sortBy: string = 'popularity.desc', language: string = 'en-US'): Promise<TMDBShow[]> {
  const genreParam = genreId ? `&with_genres=${genreId}` : '';
  let extraParams = '';
  
  if (sortBy === 'vote_average.desc') {
    extraParams = '&vote_count.gte=300';
  } else if (sortBy === 'first_air_date.desc') {
    extraParams = '&vote_count.gte=100&vote_average.gte=1';
  }

  const url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=${language}&sort_by=${sortBy}&page=${page}${genreParam}${extraParams}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("TMDB Discover Error:", error);
    return [];
  }
}
