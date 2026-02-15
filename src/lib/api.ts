// Client-side API helpers

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

export function logTitle(data: {
  tmdb_id: number;
  type: string;
  status: string;
  sentiment?: string;
  rating?: number;
  last_season?: number;
  last_episode?: number;
  favorite?: boolean;
}) {
  return api("/api/log", { method: "POST", body: JSON.stringify(data) });
}

export function updateTitle(tmdb_id: number, type: string, updates: Record<string, unknown>) {
  return api("/api/log", { method: "PATCH", body: JSON.stringify({ tmdb_id, type, ...updates }) });
}

export function updateProgress(tmdb_id: number, type: string, season: number, episode: number) {
  return updateTitle(tmdb_id, type, { last_season: season, last_episode: episode });
}

export function toggleFavorite(tmdb_id: number, type: string, favorite: boolean) {
  return updateTitle(tmdb_id, type, { favorite });
}

export function removeTitle(tmdb_id: number, type: string) {
  return api("/api/log", { method: "DELETE", body: JSON.stringify({ tmdb_id, type }) });
}

export function addExclusion(tmdb_id: number, type: string, reason?: string) {
  return api("/api/exclusions", { method: "POST", body: JSON.stringify({ tmdb_id, type, reason }) });
}

export function removeExclusion(tmdb_id: number, type: string) {
  return api("/api/exclusions", { method: "DELETE", body: JSON.stringify({ tmdb_id, type }) });
}

export function submitFeedback(tmdb_id: number, type: string, feedback: string) {
  return api("/api/feedback", { method: "POST", body: JSON.stringify({ tmdb_id, type, feedback }) });
}

// ── Custom Lists ──

export function fetchLists() {
  return api<{ lists: import("./types").CustomList[] }>("/api/lists");
}

export function createList(name: string, description?: string) {
  return api<{ list: import("./types").CustomList }>("/api/lists", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

export function fetchList(id: string) {
  return api<{ list: import("./types").CustomListWithItems }>(`/api/lists/${id}`);
}

export function updateList(id: string, data: { name?: string; description?: string }) {
  return api<{ list: import("./types").CustomList }>(`/api/lists/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteList(id: string) {
  return api<{ ok: true }>(`/api/lists/${id}`, { method: "DELETE" });
}

export function addToList(listId: string, tmdb_id: number, type: string) {
  return api<{ item: import("./types").CustomListItem }>(`/api/lists/${listId}/items`, {
    method: "POST",
    body: JSON.stringify({ tmdb_id, type }),
  });
}

export function removeFromList(listId: string, tmdb_id: number, type: string) {
  return api<{ ok: true }>(`/api/lists/${listId}/items`, {
    method: "DELETE",
    body: JSON.stringify({ tmdb_id, type }),
  });
}

// ── Account Links ──

export function fetchLinks() {
  return api<{ links: import("./types").AccountLinkDisplay[] }>("/api/links");
}

export function createInvite() {
  return api<{ link: import("./types").AccountLink }>("/api/links", { method: "POST" });
}

export function acceptInvite(invite_code: string) {
  return api<{ link: import("./types").AccountLink }>("/api/links/accept", {
    method: "POST",
    body: JSON.stringify({ invite_code }),
  });
}

export function updateLinkSharing(link_id: string, shared_list_ids: string[]) {
  return api<{ link: import("./types").AccountLink }>("/api/links", {
    method: "PATCH",
    body: JSON.stringify({ link_id, shared_list_ids }),
  });
}

export function revokeLink(link_id: string) {
  return api<{ ok: true }>("/api/links", {
    method: "DELETE",
    body: JSON.stringify({ link_id }),
  });
}

export function fetchSharedLists() {
  return api<{ sharedLists: import("./types").SharedList[] }>("/api/shared-lists");
}

// ── Friend Overlap ──

export async function fetchFriendOverlaps(): Promise<Record<string, import("./types").FriendOverlap[]>> {
  const data = await api<{ overlaps: Record<string, import("./types").FriendOverlap[]> }>("/api/friends/titles");
  return data.overlaps;
}
