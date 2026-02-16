export async function prefetchNetflixIds(tmdbIds: { id: number; type: string }[]) {
  for (let i = 0; i < tmdbIds.length; i += 3) {
    const batch = tmdbIds.slice(i, i + 3);
    await Promise.all(
      batch.map(({ id, type }) =>
        fetch(`/api/netflix-id?tmdb_id=${id}&type=${type}`)
          .catch(() => null)
      )
    );
    if (i + 3 < tmdbIds.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}
