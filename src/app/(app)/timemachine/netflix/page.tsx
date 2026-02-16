"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import GlowButton from "@/components/GlowButton";

interface ParsedTitle {
  originalTitle: string;
  showName: string;
  season: string | null;
  episode: string | null;
  isMovie: boolean;
  date: string | null;
}

interface MatchedItem {
  parsed: ParsedTitle;
  tmdb: {
    id: number;
    title: string;
    poster_path: string | null;
    media_type: "movie" | "tv";
    year: string;
  } | null;
  status: "matched" | "unmatched" | "skipped";
}

export default function NetflixImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<"upload" | "profile" | "parsing" | "review" | "importing" | "done">("upload");
  const [dragOver, setDragOver] = useState(false);
  const [matchedItems, setMatchedItems] = useState<MatchedItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState({ added: 0, skipped: 0 });
  const [error, setError] = useState("");
  const [csvText, setCsvText] = useState("");
  const [profiles, setProfiles] = useState<{ name: string; count: number }[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  // Parse a single CSV line handling quoted fields
  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  // Detect if a string looks like a date/timestamp (YYYY-MM-DD... or DD/MM/YYYY...)
  function looksLikeDate(s: string): boolean {
    const t = s.trim();
    return /^\d{4}-\d{2}-\d{2}/.test(t) || /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(t);
  }

  // Extract unique Netflix profiles from CSV
  function extractProfiles(text: string): { name: string; count: number }[] {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headerCols = parseCSVLine(lines[0]);
    const headerLower = headerCols.map((h) => h.toLowerCase().trim());
    let profileIdx = headerLower.findIndex((h) => h === "profile name");
    if (profileIdx === -1) profileIdx = headerLower.findIndex((h) => h.includes("profile"));

    if (profileIdx === -1) return [];

    // Find supplemental type column to skip trailers
    let supplementalIdx = headerLower.findIndex((h) => h.includes("supplemental"));

    const counts = new Map<string, number>();
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      const profile = (cols[profileIdx] || "").trim();
      if (!profile) continue;
      // Skip trailers/hooks
      if (supplementalIdx >= 0 && (cols[supplementalIdx] || "").trim()) continue;
      counts.set(profile, (counts.get(profile) || 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Parse the Netflix CSV file
  function parseNetflixCSV(text: string, profileFilter?: string): ParsedTitle[] {
    const lines = text.trim().split("\n");
    const titles = new Map<string, ParsedTitle>();

    if (lines.length < 2) return [];

    // Parse header row to find column indices dynamically
    const headerCols = parseCSVLine(lines[0]);
    const headerLower = headerCols.map((h) => h.toLowerCase().trim());

    // Find profile column for filtering
    let profileIdx = headerLower.findIndex((h) => h === "profile name");
    if (profileIdx === -1) profileIdx = headerLower.findIndex((h) => h.includes("profile"));

    // Find supplemental type column to skip trailers
    let supplementalIdx = headerLower.findIndex((h) => h.includes("supplemental"));

    // Find title column: look for "title" in any header
    let titleIdx = headerLower.findIndex((h) => h === "title");
    if (titleIdx === -1) titleIdx = headerLower.findIndex((h) => h.includes("title"));

    // Find date column: look for "date", "start time", etc.
    let dateIdx = headerLower.findIndex((h) => h === "date" || h === "start time");
    if (dateIdx === -1) dateIdx = headerLower.findIndex((h) => h.includes("date") || h.includes("time"));

    // Fallback: if no title column found in header, detect from first data row
    if (titleIdx === -1 && lines.length > 1) {
      const firstRow = parseCSVLine(lines[1]);
      // The title column is the one that doesn't look like a date, duration, number, or country code
      for (let c = 0; c < firstRow.length; c++) {
        const val = firstRow[c].trim();
        if (!val) continue;
        // Skip if it looks like a date, duration (HH:MM:SS), number-only, or short code
        if (looksLikeDate(val)) continue;
        if (/^\d{1,2}:\d{2}:\d{2}$/.test(val)) continue;
        if (/^\d+$/.test(val)) continue;
        if (val.length <= 3 && /^[A-Z]{2,3}$/.test(val)) continue;
        // This column likely contains the title
        titleIdx = c;
        break;
      }
      // Also find the date column from data
      if (dateIdx === -1) {
        for (let c = 0; c < firstRow.length; c++) {
          if (c === titleIdx) continue;
          if (looksLikeDate(firstRow[c].trim())) {
            dateIdx = c;
            break;
          }
        }
      }
    }

    // Last resort fallback: simple format (title=0, date=1)
    if (titleIdx === -1) titleIdx = 0;

    const startIndex = 1; // always skip header row

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = parseCSVLine(line);

      // Filter by profile if specified
      if (profileFilter && profileIdx >= 0) {
        const rowProfile = (cols[profileIdx] || "").trim();
        if (rowProfile !== profileFilter) continue;
      }

      // Skip trailers/hooks/supplemental content
      if (supplementalIdx >= 0 && (cols[supplementalIdx] || "").trim()) continue;

      let title = (cols[titleIdx] || "").trim();
      const date = dateIdx >= 0 ? (cols[dateIdx] || "").trim() : null;

      if (!title) continue;

      // Safety: if "title" still looks like a date, the detection was wrong — try other columns
      if (looksLikeDate(title)) {
        let found = false;
        for (let c = 0; c < cols.length; c++) {
          const val = cols[c].trim();
          if (!val || looksLikeDate(val)) continue;
          if (/^\d{1,2}:\d{2}:\d{2}$/.test(val)) continue;
          if (/^\d+$/.test(val)) continue;
          if (val.length <= 3 && /^[A-Z]{2,3}$/.test(val)) continue;
          title = val;
          found = true;
          break;
        }
        if (!found) continue;
      }

      // Skip trailers, hooks, teasers
      const lowerTitle = title.toLowerCase();
      if (
        lowerTitle.includes("(trailer)") ||
        lowerTitle.includes("hook") ||
        lowerTitle.includes("teaser") ||
        lowerTitle.includes("recap")
      ) continue;

      // Parse "Show Name: Season X: Episode Name"
      const parts = title.split(":").map((p) => p.trim());
      const showName = parts[0];
      const season = parts.length > 1 ? parts[1] : null;
      const episode = parts.length > 2 ? parts.slice(2).join(": ") : null;
      const isMovie = parts.length === 1;

      // Deduplicate: keep unique show names (for TV) or movie titles
      const key = isMovie ? title : showName;
      if (!titles.has(key)) {
        titles.set(key, {
          originalTitle: title,
          showName,
          season,
          episode,
          isMovie,
          date: date && !looksLikeDate(date) ? null : date,
        });
      }
    }

    return Array.from(titles.values());
  }

  // Handle file upload — detect profiles first
  const handleFile = useCallback(async (file: File) => {
    setError("");

    if (!file.name.endsWith(".csv")) {
      setError("Vennligst last opp en CSV-fil.");
      return;
    }

    try {
      const text = await file.text();
      setCsvText(text);

      const detectedProfiles = extractProfiles(text);
      if (detectedProfiles.length > 1) {
        setProfiles(detectedProfiles);
        setSelectedProfile(null);
        setStep("profile");
        return;
      }

      // Single profile or no profile column — go straight to parsing
      startMatching(text, detectedProfiles.length === 1 ? detectedProfiles[0].name : undefined);
    } catch {
      setError("Kunne ikke lese filen. Prøv igjen.");
      setStep("upload");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start TMDB matching for selected profile
  async function startMatching(text: string, profileFilter?: string) {
    setStep("parsing");

    try {
      const parsed = parseNetflixCSV(text, profileFilter);

      if (parsed.length === 0) {
        setError("Fant ingen titler i filen. Er dette riktig Netflix-fil?");
        setStep("upload");
        return;
      }

      setProgress({ current: 0, total: parsed.length });

      // Match against TMDB in batches
      const matched: MatchedItem[] = [];
      const batchSize = 5;

      for (let i = 0; i < parsed.length; i += batchSize) {
        const batch = parsed.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map(async (item) => {
            try {
              const res = await fetch(
                `/api/import/netflix/match?` +
                  new URLSearchParams({
                    query: item.showName,
                    type: item.isMovie ? "movie" : "tv",
                  })
              );
              const data = await res.json();
              return {
                parsed: item,
                tmdb: data.result || null,
                status: data.result ? "matched" : "unmatched",
              } as MatchedItem;
            } catch {
              return {
                parsed: item,
                tmdb: null,
                status: "unmatched",
              } as MatchedItem;
            }
          })
        );

        matched.push(...results);
        setProgress({ current: Math.min(i + batchSize, parsed.length), total: parsed.length });
      }

      setMatchedItems(matched);
      // Auto-select all matched items
      const autoSelected = new Set<number>();
      matched.forEach((item, idx) => {
        if (item.status === "matched") autoSelected.add(idx);
      });
      setSelectedItems(autoSelected);
      setStep("review");
    } catch {
      setError("Kunne ikke lese filen. Prøv igjen.");
      setStep("upload");
    }
  }

  // Handle drag & drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // Toggle item selection
  function toggleItem(idx: number) {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  // Select/deselect all
  function toggleAll() {
    if (selectedItems.size === matchedItems.filter((i) => i.tmdb).length) {
      setSelectedItems(new Set());
    } else {
      const all = new Set<number>();
      matchedItems.forEach((item, idx) => {
        if (item.tmdb) all.add(idx);
      });
      setSelectedItems(all);
    }
  }

  // Import selected items
  async function handleImport() {
    setStep("importing");
    const toImport = Array.from(selectedItems)
      .map((idx) => matchedItems[idx])
      .filter((item) => item.tmdb);

    setProgress({ current: 0, total: toImport.length });

    let added = 0;
    let skipped = 0;
    const batchSize = 10;

    for (let i = 0; i < toImport.length; i += batchSize) {
      const batch = toImport.slice(i, i + batchSize);

      try {
        const res = await fetch("/api/import/netflix/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: batch.map((item) => ({
              tmdb_id: item.tmdb!.id,
              type: item.tmdb!.media_type,
            })),
          }),
        });

        const data = await res.json();
        added += data.added || 0;
        skipped += data.skipped || 0;
      } catch {
        skipped += batch.length;
      }

      setProgress({ current: Math.min(i + batchSize, toImport.length), total: toImport.length });
    }

    setImportResult({ added, skipped });
    setStep("done");
  }

  const matchedCount = matchedItems.filter((i) => i.tmdb).length;
  const unmatchedCount = matchedItems.filter((i) => !i.tmdb).length;

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/timemachine"
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors mb-3 inline-flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Tidsmaskinen
        </Link>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Importer fra Netflix</h2>
        <p className="text-sm text-[var(--text-tertiary)]">
          Last opp din Netflix-historikk og legg til alt du har sett i Logflix.
        </p>
      </div>

      {/* Step: Upload */}
      {step === "upload" && (
        <div>
          {/* Instructions */}
          <div className="glass rounded-[var(--radius-lg)] p-5 mb-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Slik henter du filen:</h3>
            <ol className="space-y-2.5 text-sm text-[var(--text-secondary)]">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-glow)] text-[var(--accent-light)] text-xs font-bold flex items-center justify-center">1</span>
                <span>
                  Gå til{" "}
                  <a
                    href="https://www.netflix.com/viewingactivity"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent-light)] underline"
                  >
                    netflix.com/viewingactivity
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-glow)] text-[var(--accent-light)] text-xs font-bold flex items-center justify-center">2</span>
                <span>Scroll helt ned og klikk <strong className="text-[var(--text-primary)]">«Last ned alt»</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-glow)] text-[var(--accent-light)] text-xs font-bold flex items-center justify-center">3</span>
                <span>Last opp CSV-filen her</span>
              </li>
            </ol>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`glass border-2 border-dashed rounded-[var(--radius-lg)] p-12 text-center transition-all cursor-pointer ${
              dragOver
                ? "border-[var(--accent)] bg-[var(--accent-glow)]"
                : "border-[var(--glass-border)] hover:border-[var(--text-tertiary)]"
            }`}
            onClick={() => document.getElementById("netflix-file-input")?.click()}
          >
            <input
              id="netflix-file-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <div className="text-4xl mb-3" style={{ color: "#e50914" }}>
              <svg className="w-10 h-10 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c.043.043.105.07.18.085 1.712.12 3.434.363 5.13.755V0zm-8.487 0H.054v24c2.6-.45 5.274-.638 7.918-.627-.507-1.416-1.076-3.02-2.572-7.27z" />
              </svg>
            </div>
            <p className="text-[var(--text-secondary)] mb-1 text-sm">
              Dra og slipp CSV-filen her
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              eller klikk for å velge fil
            </p>
          </div>

          {error && (
            <div className="mt-4 text-sm text-[var(--red)] bg-[var(--red-glow)] rounded-[var(--radius-md)] px-4 py-3 border border-[rgba(248,113,113,0.1)]">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Step: Profile Selection */}
      {step === "profile" && (
        <div>
          <div className="glass rounded-[var(--radius-lg)] p-5 mb-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Velg profil</h3>
            <p className="text-xs text-[var(--text-tertiary)] mb-4">
              Vi fant flere Netflix-profiler i filen. Velg hvilken profil du vil importere fra.
            </p>

            <div className="space-y-2">
              {profiles.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setSelectedProfile(p.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-[var(--radius-md)] border transition-all text-left ${
                    selectedProfile === p.name
                      ? "border-[var(--accent)]/30 bg-[var(--accent-glow)]"
                      : "border-[var(--glass-border)] bg-white/[0.02] hover:border-[var(--text-tertiary)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      selectedProfile === p.name
                        ? "bg-[var(--accent)] text-white"
                        : "bg-white/[0.06] text-[var(--text-secondary)]"
                    }`}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span className={`text-sm font-medium ${
                      selectedProfile === p.name ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                    }`}>
                      {p.name}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {p.count} avspillinger
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <GlowButton
              variant="ghost"
              onClick={() => {
                setStep("upload");
                setCsvText("");
                setProfiles([]);
                setSelectedProfile(null);
              }}
            >
              Tilbake
            </GlowButton>
            <GlowButton
              onClick={() => {
                if (selectedProfile) startMatching(csvText, selectedProfile);
              }}
              disabled={!selectedProfile}
              fullWidth
            >
              Importer fra {selectedProfile || "..."}
            </GlowButton>
          </div>
        </div>
      )}

      {/* Step: Parsing / Matching */}
      {step === "parsing" && (
        <div className="text-center py-16">
          <div className="w-12 h-12 border-[3px] border-[var(--glass-border)] border-t-[var(--accent)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)] mb-2 text-sm">Matcher titler med TMDB...</p>
          <p className="text-xs text-[var(--text-tertiary)]">
            {progress.current} / {progress.total} titler
          </p>
          <div className="w-64 mx-auto mt-4 h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
              style={{
                width: progress.total > 0
                  ? `${(progress.current / progress.total) * 100}%`
                  : "0%",
              }}
            />
          </div>
        </div>
      )}

      {/* Step: Review */}
      {step === "review" && (
        <div>
          {/* Summary bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-4 text-sm">
              <span className="text-[var(--green)]">
                <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {matchedCount} funnet
              </span>
              {unmatchedCount > 0 && (
                <span className="text-[var(--text-tertiary)]">
                  {unmatchedCount} ikke funnet
                </span>
              )}
            </div>
            <button
              onClick={toggleAll}
              className="text-xs text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors font-medium"
            >
              {selectedItems.size === matchedCount ? "Fjern alle" : "Velg alle"}
            </button>
          </div>

          {/* Items list */}
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
            {matchedItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-[var(--radius-md)] border transition-all cursor-pointer ${
                  !item.tmdb
                    ? "opacity-40 border-[var(--glass-border)] bg-white/[0.02]"
                    : selectedItems.has(idx)
                    ? "border-[var(--accent)]/30 bg-[var(--accent-glow)]"
                    : "border-[var(--glass-border)] bg-white/[0.02]"
                }`}
                onClick={() => item.tmdb && toggleItem(idx)}
              >
                {/* Checkbox */}
                <div
                  className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-all ${
                    selectedItems.has(idx)
                      ? "bg-[var(--accent)] border-[var(--accent)]"
                      : "border-[var(--glass-border)]"
                  }`}
                >
                  {selectedItems.has(idx) && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>

                {/* Poster */}
                {item.tmdb?.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w92${item.tmdb.poster_path}`}
                    alt=""
                    width={40}
                    height={56}
                    className="rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-14 rounded bg-[var(--bg-surface)] flex-shrink-0 flex items-center justify-center text-xs text-[var(--text-tertiary)]">
                    ?
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {item.tmdb?.title || item.parsed.showName}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {item.tmdb ? (
                      <>
                        {item.tmdb.media_type === "tv" ? "Serie" : "Film"}
                        {item.tmdb.year && ` · ${item.tmdb.year}`}
                      </>
                    ) : (
                      "Ikke funnet i TMDB"
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Import button */}
          <div className="mt-6 flex gap-3">
            <GlowButton
              variant="ghost"
              onClick={() => {
                setStep("upload");
                setMatchedItems([]);
                setSelectedItems(new Set());
              }}
            >
              Avbryt
            </GlowButton>
            <GlowButton
              onClick={handleImport}
              disabled={selectedItems.size === 0}
              fullWidth
            >
              Importer {selectedItems.size} titler
            </GlowButton>
          </div>
        </div>
      )}

      {/* Step: Importing */}
      {step === "importing" && (
        <div className="text-center py-16">
          <div className="w-12 h-12 border-[3px] border-[var(--glass-border)] border-t-[var(--accent)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)] mb-2 text-sm">Legger til i biblioteket...</p>
          <p className="text-xs text-[var(--text-tertiary)]">
            {progress.current} / {progress.total}
          </p>
          <div className="w-64 mx-auto mt-4 h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
              style={{
                width: progress.total > 0
                  ? `${(progress.current / progress.total) * 100}%`
                  : "0%",
              }}
            />
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-[var(--green-glow)] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[var(--green)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Import ferdig!</h3>
          <p className="text-[var(--text-secondary)] text-sm mb-1">
            <span className="text-[var(--green)] font-semibold">{importResult.added}</span> titler lagt til i biblioteket
          </p>
          {importResult.skipped > 0 && (
            <p className="text-xs text-[var(--text-tertiary)]">
              {importResult.skipped} hoppet over (allerede i biblioteket)
            </p>
          )}
          <div className="flex gap-3 justify-center mt-8">
            <GlowButton
              variant="ghost"
              onClick={() => {
                setStep("upload");
                setMatchedItems([]);
                setSelectedItems(new Set());
              }}
            >
              Importer flere
            </GlowButton>
            <GlowButton onClick={() => router.push("/library")}>
              Gå til biblioteket
            </GlowButton>
          </div>
        </div>
      )}
    </div>
  );
}
