import type { MediaType, Sentiment } from "@/lib/types";

// ── DB enums ────────────────────────────────────────────────────────

export type GroupSessionStatus =
  | "lobby"
  | "pool_ready"
  | "swiping"
  | "final_voting"
  | "completed";

export type GroupMediaFilter = "movie" | "tv" | "both";

// ── Pool item (stored in group_sessions.pool JSONB) ─────────────────

export interface GroupPoolItem {
  tmdb_id: number;
  media_type: MediaType;
  title: string;
  poster_path: string | null;
  overview: string;
  vote_average: number | null;
  year: number | null;
  genre_ids: number[];
}

// ── DB row: group_sessions ──────────────────────────────────────────

/** votes JSONB: { [user_id]: { "tmdb_id:media_type": "liked"|"neutral"|"disliked" } } */
export type GroupVotesMap = Record<string, Record<string, Sentiment>>;

/** final_votes JSONB: { [user_id]: "tmdb_id" } — one pick per participant */
export type GroupFinalVotesMap = Record<string, string>;

export interface GroupSession {
  id: string;
  code: string;
  host_user_id: string;
  status: GroupSessionStatus;
  media_filter: GroupMediaFilter;
  provider_region: string;
  min_participants: number;
  pool: GroupPoolItem[];
  votes: GroupVotesMap;
  final_votes: GroupFinalVotesMap;
  finalist_tmdb_ids: number[];
  final_pick_tmdb_id: number | null;
  final_pick_media_type: MediaType | null;
  created_at: string;
  updated_at: string;
}

// ── DB row: group_session_participants ───────────────────────────────

export interface GroupParticipant {
  id: string;
  session_id: string;
  user_id: string;
  display_name: string | null;
  provider_ids: number[];
  joined_at: string;
}

// ── API request/response types ──────────────────────────────────────

export interface CreateGroupRequest {
  display_name: string;
  media_filter?: GroupMediaFilter;
  provider_ids?: number[];
  provider_region?: string;
}

export interface CreateGroupResponse {
  session: GroupSession;
  code: string;
}

export interface JoinGroupRequest {
  code: string;
  display_name: string;
  provider_ids?: number[];
}

export interface JoinGroupResponse {
  session: GroupSession;
  participants: GroupParticipant[];
}

// ── Polling payload ─────────────────────────────────────────────────

export interface GroupStateResponse {
  session: GroupSession;
  participants: GroupParticipant[];
  my_votes: Record<string, Sentiment>;
  my_vote_count: number;
  votes_per_participant: Record<string, number>;
  pool: GroupPoolItem[] | null;
  finalists: GroupPoolItem[] | null;
  final_pick: GroupPoolItem | null;
}
