import type { Media } from "./types";

export type Track = "sub" | "dub";

export const ZOKO_ORIGIN = "https://zokoanime.video";
export const ZOKO_ACCENT = "8b5cf6";

type ZokoOptions = {
  color?: string;
  autonext?: boolean;
  autoskip?: boolean;
  retry?: number;
};

export function zokoUrl(
  media: Pick<Media, "id" | "idMal">,
  episode: number,
  track: Track,
  options: ZokoOptions = {},
): string {
  const source = media.idMal ? "mal" : "anilist";
  const id = media.idMal ?? media.id;
  const safeEpisode = Math.max(1, Math.floor(episode) || 1);
  const params = new URLSearchParams();

  params.set("color", options.color ?? ZOKO_ACCENT);
  if (options.autonext !== false) params.set("autonext", "1");
  if (options.autoskip !== false) params.set("asi", "1");
  if (options.retry) params.set("_r", String(options.retry));

  return `${ZOKO_ORIGIN}/stream/${source}/${id}/${safeEpisode}/${track}?${params.toString()}`;
}
