import type { Media } from "./types";

export function getEpisodeCount(
  media: Pick<
    Media,
    "episodes" | "nextAiringEpisode" | "streamingEpisodes" | "format"
  >,
): number {
  const aired = media.nextAiringEpisode
    ? Math.max(1, media.nextAiringEpisode.episode - 1)
    : null;

  const count =
    media.episodes ?? aired ?? media.streamingEpisodes?.length ?? 1;

  return Math.max(1, Math.floor(Number.isFinite(count) ? count : 1));
}

export function parseEpisodeTitle(raw: string): {
  number: number | null;
  title: string;
} {
  const value = (raw ?? "").trim();
  const withNumber = value.match(
    /^episode\s+(\d+)\s*[-–—:]\s*(.+)$/i,
  );

  if (withNumber) {
    return {
      number: Number(withNumber[1]),
      title: withNumber[2].trim() || `Episode ${withNumber[1]}`,
    };
  }

  const onlyNumber = value.match(/^episode\s+(\d+)\b/i);
  if (onlyNumber) {
    return {
      number: Number(onlyNumber[1]),
      title: value,
    };
  }

  return { number: null, title: value };
}

export function getEpisodeTitles(
  media: Pick<Media, "streamingEpisodes">,
): Record<number, string> {
  const titles: Record<number, string> = {};

  (media.streamingEpisodes ?? []).forEach((episode, index) => {
    const parsed = parseEpisodeTitle(episode.title);
    const number = parsed.number ?? index + 1;
    if (parsed.title) titles[number] = parsed.title;
  });

  return titles;
}

export function getEpisodeTitle(
  titles: Record<number, string>,
  episode: number,
): string {
  return titles[episode] ?? `Episode ${episode}`;
}

export type EpisodeOrder = "asc" | "desc";

export function episodePageIndex(
  total: number,
  size: number,
  episode: number,
  order: EpisodeOrder,
): number {
  const safeTotal = Math.max(1, Math.floor(total) || 1);
  const safeSize = Math.max(1, Math.floor(size) || 1);
  const safeEpisode = Math.min(
    Math.max(1, Math.floor(episode) || 1),
    safeTotal,
  );
  const position =
    order === "desc" ? safeTotal - safeEpisode : safeEpisode - 1;

  return Math.floor(position / safeSize);
}

export function episodePage(
  total: number,
  size: number,
  page: number,
  order: EpisodeOrder,
): {
  start: number;
  end: number;
  episodes: number[];
  pageCount: number;
  safePage: number;
} {
  const safeTotal = Math.max(1, Math.floor(total) || 1);
  const safeSize = Math.max(1, Math.floor(size) || 1);
  const pageCount = Math.max(1, Math.ceil(safeTotal / safeSize));
  const safePage = Math.min(
    Math.max(0, Math.floor(page) || 0),
    pageCount - 1,
  );
  const start =
    order === "desc"
      ? Math.max(1, safeTotal - safePage * safeSize - safeSize + 1)
      : safePage * safeSize + 1;
  const end =
    order === "desc"
      ? Math.max(0, safeTotal - safePage * safeSize)
      : Math.min(safeTotal, (safePage + 1) * safeSize);

  const episodes = Array.from(
    { length: Math.max(0, end - start + 1) },
    (_, index) => start + index,
  );
  if (order === "desc") episodes.reverse();

  return { start, end, episodes, pageCount, safePage };
}
