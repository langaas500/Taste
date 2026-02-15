import type { ContentFilters } from "./types";

export interface FilterPreset {
  id: string;
  label: string;
  description: string;
  type: "exclude_language" | "exclude_genre" | "prefer_language";
  languages?: string[];
  genres?: number[];
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: "anime",
    label: "Anime",
    description: "Ekskluder animasjon/anime",
    type: "exclude_genre",
    genres: [16],
  },
  {
    id: "asian",
    label: "Asiatisk",
    description: "Ekskluder japansk, koreansk, kinesisk og thailandsk",
    type: "exclude_language",
    languages: ["ja", "ko", "zh", "th"],
  },
  {
    id: "bollywood",
    label: "Bollywood",
    description: "Ekskluder indisk/hindi innhold",
    type: "exclude_language",
    languages: ["hi"],
  },
  {
    id: "swedish",
    label: "Svensk",
    description: "Ekskluder svensk innhold",
    type: "exclude_language",
    languages: ["sv"],
  },
  {
    id: "turkish",
    label: "Tyrkisk",
    description: "Ekskluder tyrkisk innhold",
    type: "exclude_language",
    languages: ["tr"],
  },
  {
    id: "english_pref",
    label: "Foretrekk engelsk",
    description: "Prioriter engelskspraklig innhold",
    type: "prefer_language",
    languages: ["en"],
  },
  {
    id: "norwegian_pref",
    label: "Foretrekk norsk",
    description: "Prioriter norsk innhold",
    type: "prefer_language",
    languages: ["no"],
  },
];

export function presetsToFilters(activeIds: string[]): ContentFilters {
  const filters: ContentFilters = {
    excluded_languages: [],
    excluded_genres: [],
    preferred_languages: [],
  };

  for (const id of activeIds) {
    const preset = FILTER_PRESETS.find((p) => p.id === id);
    if (!preset) continue;

    if (preset.type === "exclude_language" && preset.languages) {
      filters.excluded_languages!.push(...preset.languages);
    }
    if (preset.type === "exclude_genre" && preset.genres) {
      filters.excluded_genres!.push(...preset.genres);
    }
    if (preset.type === "prefer_language" && preset.languages) {
      filters.preferred_languages!.push(...preset.languages);
    }
  }

  filters.excluded_languages = [...new Set(filters.excluded_languages)];
  filters.excluded_genres = [...new Set(filters.excluded_genres)];
  filters.preferred_languages = [...new Set(filters.preferred_languages)];

  return filters;
}

export function filtersToPresets(filters: ContentFilters): string[] {
  const activeIds: string[] = [];

  for (const preset of FILTER_PRESETS) {
    if (preset.type === "exclude_language" && preset.languages) {
      if (preset.languages.every((l) => filters.excluded_languages?.includes(l))) {
        activeIds.push(preset.id);
      }
    } else if (preset.type === "exclude_genre" && preset.genres) {
      if (preset.genres.every((g) => filters.excluded_genres?.includes(g))) {
        activeIds.push(preset.id);
      }
    } else if (preset.type === "prefer_language" && preset.languages) {
      if (preset.languages.every((l) => filters.preferred_languages?.includes(l))) {
        activeIds.push(preset.id);
      }
    }
  }

  return activeIds;
}
