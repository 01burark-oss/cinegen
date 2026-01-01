
export type FeedbackType = "LIKED" | "INTERESTED" | "NEVER_AGAIN";

export interface LibraryItem {
  id: string;
  tmdb_id: number;
  title: string;
  rating: number; // User rating (1-10)
  poster_path?: string | null;
  added_at: number;
  vote_average?: number;
  first_air_date?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  tmdb_id: number;
  imdb_rating: number;
  trailer_url: string;
  reviews: string[];
  poster_path?: string | null;
  match_score: number;
  reasoning: string;
  scores: {
    depth: number;       // Senaryo Derinliği
    visuals: number;     // Görsellik
    acting: number;      // Oyunculuk
    pacing: number;      // Tempo
    originality: number; // Özgünlük
  };
  signals: {
    tone: string;
    pacing: string;
    narrative_style: string;
    archetype_match: string;
  };
}

export enum EngineStep {
  INITIAL_GREETING,
  PICK_LONG_TERM,
  PICK_SHORT_TERM,
  PREFERENCES,
  RESULTS,
  DASHBOARD
}

export interface UserHistoryItem {
  showId: string;
  title: string;
  weight: number;
}

export interface CandidateShow {
  id: string;
  features: {
    embedding: number[];
  };
  score: number;
}

export interface MemoryItem {
  source: "LONG_TERM" | "SHORT_TERM";
  weight: number;
  features: {
    embedding: number[];
  };
}

export interface BlockedSeries {
  tmdb_id: number;
  title: string;
}

export interface SelectedShow {
  id?: number;
  tmdb_id?: number;
  name?: string;
  title?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  imdb_rating?: number;
  first_air_date?: string;
  overview?: string;
  reasoning?: string;
  scores?: Recommendation['scores'];
  match_score?: number;
}
