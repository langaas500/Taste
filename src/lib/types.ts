export type MediaType = "movie" | "tv";
export type Status = "watched" | "watchlist";
export type Sentiment = "liked" | "disliked" | "neutral";
export type FeedbackType = "like_suggestion" | "not_for_me";

export interface TitleCache {
  tmdb_id: number;
  type: MediaType;
  imdb_id: string | null;
  title: string;
  original_title: string | null;
  year: number | null;
  overview: string | null;
  genres: { id: number; name: string }[];
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number | null;
  vote_count: number | null;
  popularity: number | null;
  tmdb_payload: Record<string, unknown> | null;
  updated_at: string;
}

export interface UserTitle {
  id: string;
  user_id: string;
  tmdb_id: number;
  type: MediaType;
  status: Status;
  sentiment: Sentiment | null;
  rating: number | null;
  note: string | null;
  last_season: number | null;
  last_episode: number | null;
  watched_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserExclusion {
  id: string;
  user_id: string;
  tmdb_id: number;
  type: MediaType;
  reason: string | null;
  created_at: string;
}

export interface UserFeedback {
  id: string;
  user_id: string;
  tmdb_id: number;
  type: MediaType;
  feedback: FeedbackType;
  created_at: string;
}

export interface ContentFilters {
  excluded_languages?: string[];
  excluded_genres?: number[];
  preferred_languages?: string[];
}

export interface Profile {
  id: string;
  display_name: string | null;
  language: string;
  exploration_slider: number;
  taste_summary: TasteSummary | null;
  taste_summary_updated_at: string | null;
  content_filters: ContentFilters | null;
  created_at: string;
}

export interface TasteSummary {
  youLike: string;
  avoid: string;
  pacing: string;
  updatedAt: string;
}

export interface TMDBSearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  genre_ids: number[];
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

export interface WatchProviderData {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

// Custom Lists
export interface CustomList {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CustomListItem {
  id: string;
  list_id: string;
  tmdb_id: number;
  type: MediaType;
  position: number;
  added_at: string;
}

export interface CustomListWithItems extends CustomList {
  items: (CustomListItem & { cache?: TitleCache })[];
}

// Account Linking
export type LinkStatus = "pending" | "accepted" | "declined";

export interface AccountLink {
  id: string;
  inviter_id: string;
  invitee_id: string | null;
  invite_code: string;
  status: LinkStatus;
  shared_list_ids: string[];
  created_at: string;
  accepted_at: string | null;
}

export interface AccountLinkDisplay extends AccountLink {
  partner_name: string | null;
}

export interface SharedList {
  list: CustomList;
  items: (CustomListItem & { cache?: TitleCache })[];
  owner_name: string | null;
}

// Advanced Search
export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBPersonResult {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  known_for: TMDBSearchResult[];
}

export interface AdvancedSearchFilters {
  type: "movie" | "tv";
  genres: number[];
  providers: number[];
  yearFrom: string;
  yearTo: string;
  sortBy: string;
  withCast: number[];
}

export interface Recommendation {
  tmdb_id: number;
  type: MediaType;
  title: string;
  year: number | null;
  poster_path: string | null;
  why: string;
  tags: string[];
}
