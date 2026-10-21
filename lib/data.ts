import { anilist } from "./anilist";
import { currentSeason, titleOf } from "./format";
import type { BrowseParams } from "./params";
import {
  AZ_QUERY,
  BROWSE_QUERY,
  DETAIL_QUERY,
  HOME_QUERY,
  SCHEDULE_QUERY,
  SEARCH_QUERY,
  WATCH_QUERY,
} from "./queries";
import type {
  AzData,
  BrowseData,
  DetailData,
  HomeData,
  Media,
  ScheduleData,
  ScheduleItem,
  SearchData,
  SearchSuggestion,
  WatchData,
} from "./types";

const HOUR = 60 * 60_000;

export function getHomeData(): Promise<HomeData | null> {
  const { season, year } = currentSeason();
  return anilist<HomeData>(
    HOME_QUERY,
    {
      season,
      year,
      now: Math.floor(Date.now() / 1000),
    },
    10 * 60_000,
  );
}

export function getBrowseData(
  params: BrowseParams,
): Promise<BrowseData | null> {
  return anilist<BrowseData>(
    BROWSE_QUERY,
    {
      page: params.page,
      search: params.q.trim() || undefined,
      genre: params.genre ? [params.genre] : undefined,
      year: params.year ?? undefined,
      season: params.season || undefined,
      format: params.format || undefined,
      status: params.status || undefined,
      sort: [params.sort],
    },
    5 * 60_000,
  );
}

export async function getMedia(id: number): Promise<Media | null> {
  if (!Number.isFinite(id) || id <= 0) return null;
  const data = await anilist<DetailData>(DETAIL_QUERY, { id }, HOUR);
  return data?.Media ?? null;
}

export async function getWatchMedia(id: number): Promise<Media | null> {
  if (!Number.isFinite(id) || id <= 0) return null;
  const data = await anilist<WatchData>(WATCH_QUERY, { id }, HOUR);
  return data?.Media ?? null;
}

export async function getSearchResults(
  query: string,
): Promise<SearchSuggestion[]> {
  const search = query.trim();
  if (search.length < 2) return [];
  const data = await anilist<SearchData>(
    SEARCH_QUERY,
    { search },
    5 * 60_000,
  );
  return data?.Page.media ?? [];
}

export async function getScheduleData(): Promise<ScheduleItem[] | null> {
  const from = Math.floor(Date.now() / 1000);
  const to = from + 7 * 24 * 60 * 60;
  const items: ScheduleItem[] = [];
  let reachedEnd = false;

  for (let page = 1; page <= 3 && !reachedEnd; page += 1) {
    const data = await anilist<ScheduleData>(
      SCHEDULE_QUERY,
      { page, from, to },
      15 * 60_000,
    );

    if (!data) return page === 1 ? null : items;

    items.push(
      ...data.Page.airingSchedules.filter((item) => !item.media.isAdult),
    );
    reachedEnd = !data.Page.pageInfo.hasNextPage;
  }

  return items;
}

function normalizeTitle(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^[\s"'([\-]+/, "")
    .toLowerCase();
}

const AZ_POOL_PAGES = 8;

async function getAzPool(): Promise<Media[] | null> {
  const pages = await Promise.all(
    Array.from({ length: AZ_POOL_PAGES }, (_, index) =>
      anilist<AzData>(AZ_QUERY, { page: index + 1 }, 24 * HOUR),
    ),
  );

  if (pages.every((page) => page === null)) return null;

  return pages.flatMap((page) => page?.Page.media ?? []);
}

export async function getAzResults(letter: string): Promise<Media[] | null> {
  const normalizedLetter = letter.trim().toUpperCase().slice(0, 1);
  if (!/^[A-Z]$/.test(normalizedLetter)) return [];

  const pool = await getAzPool();
  if (!pool) return null;

  const seen = new Set<number>();
  return pool
    .filter((media) => {
      if (!media || media.isAdult || seen.has(media.id)) return false;
      const titles = [media.title.romaji, media.title.english].filter(
        (title): title is string => Boolean(title),
      );
      if (
        !titles.some((title) =>
          normalizeTitle(title).startsWith(normalizedLetter.toLowerCase()),
        )
      ) {
        return false;
      }
      seen.add(media.id);
      return true;
    })
    .sort((a, b) => titleOf(a).localeCompare(titleOf(b)));
}
