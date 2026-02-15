/**
 * Guest title actions stored in localStorage.
 * Persisted until migration to user_titles after authentication.
 */

const STORAGE_KEY = "logflix_guest_title_actions_v1";
const MAX_ENTRIES = 100;

export type GuestAction = "liked" | "disliked" | "neutral" | "watchlist" | "watched";

export interface GuestTitleEntry {
  tmdb_id: number;
  type: "movie" | "tv";
  action: GuestAction;
  ts: number;
}

export function readGuestTitleActions(): GuestTitleEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeGuestTitleActions(entries: GuestTitleEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* storage full or unavailable */
  }
}

export function recordGuestTitleAction(entry: GuestTitleEntry): void {
  const entries = readGuestTitleActions();

  // Remove existing entry for same (tmdb_id, type) — latest wins
  const filtered = entries.filter(
    (e) => !(e.tmdb_id === entry.tmdb_id && e.type === entry.type)
  );

  filtered.push(entry);

  // Cap at MAX_ENTRIES (drop oldest)
  const capped = filtered.length > MAX_ENTRIES
    ? filtered.slice(filtered.length - MAX_ENTRIES)
    : filtered;

  writeGuestTitleActions(capped);
}

export function clearGuestTitleActions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
