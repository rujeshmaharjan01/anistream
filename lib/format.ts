import { getEpisodeCount } from "./episodes";
import type { FuzzyDate, Media } from "./types";

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  ldquo: "“",
  rdquo: "”",
};

const FORMAT_LABELS: Record<string, string> = {
  TV: "TV",
  TV_SHORT: "TV Short",
  MOVIE: "Movie",
  SPECIAL: "Special",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "Music",
};

const STATUS_LABELS: Record<string, string> = {
  FINISHED: "Finished",
  RELEASING: "Airing",
  NOT_YET_RELEASED: "Upcoming",
  CANCELLED: "Cancelled",
  HIATUS: "Hiatus",
};

const SEASON_LABELS: Record<string, string> = {
  WINTER: "Winter",
  SPRING: "Spring",
  SUMMER: "Summer",
  FALL: "Fall",
};

export function titleOf(media: Pick<Media, "title"> | null | undefined): string {
  return media?.title?.english?.trim() || media?.title?.romaji || "Untitled";
}

export function secondaryTitle(
  media: Pick<Media, "title"> | null | undefined,
): string | null {
  if (!media) return null;
  const primary = titleOf(media);
  const romaji = media.title?.romaji?.trim();
  return romaji && romaji !== primary ? romaji : null;
}

export function yearOf(
  media: Pick<Media, "seasonYear" | "startDate"> | null | undefined,
): number | null {
  return media?.seasonYear ?? media?.startDate?.year ?? null;
}

export function scoreOf(
  media: Pick<Media, "averageScore"> | null | undefined,
): number | null {
  return media?.averageScore ?? null;
}

export function formatLabel(value?: string | null): string {
  if (!value) return "Anime";
  return FORMAT_LABELS[value] ?? value.replaceAll("_", " ");
}

export function statusLabel(value?: string | null): string | null {
  if (!value) return null;
  return STATUS_LABELS[value] ?? value.replaceAll("_", " ");
}

export function seasonLabel(value?: string | null): string | null {
  if (!value) return null;
  return SEASON_LABELS[value] ?? value;
}

export function episodesLabel(
  media: Pick<
    Media,
    "format" | "episodes" | "nextAiringEpisode" | "streamingEpisodes"
  >,
): string {
  if (media.format === "MOVIE") return "Movie";
  const count = getEpisodeCount(media);
  return count === 1 ? "1 episode" : `${count} episodes`;
}

export function runtimeLabel(minutes?: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export function dateLabel(date?: FuzzyDate | null): string | null {
  if (!date?.year) return null;
  if (!date.month) return String(date.year);
  const parsed = new Date(Date.UTC(date.year, date.month - 1, date.day ?? 1));
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export function stripHtml(value?: string | null): string {
  if (!value) return "";
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity) => {
      const body = entity.slice(1, -1);
      if (body[0] === "#") {
        const hex = body[1]?.toLowerCase() === "x";
        const code = Number.parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10);
        return Number.isFinite(code) && code >= 0 && code <= 0x10ffff
          ? String.fromCodePoint(code)
          : "";
      }
      return ENTITIES[body.toLowerCase()] ?? "";
    })
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function positiveInt(value: unknown, fallback = 1): number {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export function progressPercent(position: number, duration: number): number {
  if (!Number.isFinite(position) || !Number.isFinite(duration) || duration <= 0) {
    return 0;
  }
  return clamp(Math.round((position / duration) * 100), 0, 100);
}

export function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const rest = whole % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function timeAgo(timestamp: number, now = Date.now()): string {
  const diff = Math.max(0, now - timestamp);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

export function currentSeason(date = new Date()): {
  season: "WINTER" | "SPRING" | "SUMMER" | "FALL";
  year: number;
} {
  const month = date.getMonth() + 1;
  const season =
    month <= 3 ? "WINTER" : month <= 6 ? "SPRING" : month <= 9 ? "SUMMER" : "FALL";
  return { season, year: date.getFullYear() };
}

