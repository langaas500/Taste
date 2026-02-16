export function getNetflixTitleUrl(netflixId: string): string {
  return `https://www.netflix.com/title/${netflixId}`;
}

export function getNetflixSearchUrl(title: string): string {
  return `https://www.netflix.com/search?q=${encodeURIComponent(title)}`;
}

export function getStreamingUrl(
  providerName: string,
  title: string,
  netflixId?: string | null
): { url: string; isDirect: boolean } | null {
  const name = providerName.toLowerCase();

  if (name.includes("netflix")) {
    if (netflixId) {
      return { url: getNetflixTitleUrl(netflixId), isDirect: true };
    }
    return { url: getNetflixSearchUrl(title), isDirect: false };
  }

  if (name.includes("hbo") || name.includes("max"))
    return { url: `https://play.max.com/search?q=${encodeURIComponent(title)}`, isDirect: false };
  if (name.includes("disney"))
    return { url: `https://www.disneyplus.com/search?q=${encodeURIComponent(title)}`, isDirect: false };
  if (name.includes("viaplay"))
    return { url: `https://viaplay.no/search?query=${encodeURIComponent(title)}`, isDirect: false };
  if (name.includes("apple"))
    return { url: `https://tv.apple.com/search?term=${encodeURIComponent(title)}`, isDirect: false };
  if (name.includes("amazon") || name.includes("prime"))
    return { url: `https://www.primevideo.com/search?phrase=${encodeURIComponent(title)}`, isDirect: false };
  if (name.includes("paramount"))
    return { url: `https://www.paramountplus.com/search?q=${encodeURIComponent(title)}`, isDirect: false };
  if (name.includes("tv 2") || name.includes("tv2"))
    return { url: `https://play.tv2.no/search?query=${encodeURIComponent(title)}`, isDirect: false };

  return null;
}
