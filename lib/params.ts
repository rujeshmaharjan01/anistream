import {
  FORMATS,
  GENRES,
  SEASONS,
  SORTS,
  STATUSES,
} from "./constants";

export type BrowseParams = {
  q: string;
  genre: string;
  year: number | null;
  season: string;
  format: string;
  status: string;
  sort: string;
  page: number;
};

export const DEFAULT_BROWSE: BrowseParams = {
  q: "",
  genre: "",
  year: null,
  season: "",
  format: "",
  status: "",
  sort: "POPULARITY_DESC",
  page: 1,
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function matches(
  options: readonly { value: string }[],
  value: string,
): boolean {
  return options.some((option) => option.value === value);
}

export function parseBrowseParams(raw: RawParams): BrowseParams {
  const currentYear = new Date().getFullYear();
  const yearValue = Number.parseInt(first(raw.year), 10);
  const pageValue = Number.parseInt(first(raw.page), 10);
  const year =
    Number.isFinite(yearValue) && yearValue >= 1900 && yearValue <= currentYear + 2
      ? yearValue
      : null;
  const page =
    Number.isFinite(pageValue) && pageValue > 0 ? Math.min(pageValue, 500) : 1;
  const genre = first(raw.genre);
  const season = first(raw.season);
  const format = first(raw.format);
  const status = first(raw.status);
  const sort = first(raw.sort);

  return {
    q: first(raw.q).slice(0, 80),
    genre: (GENRES as readonly string[]).includes(genre) ? genre : "",
    year,
    season: matches(SEASONS, season) ? season : "",
    format: matches(FORMATS, format) ? format : "",
    status: matches(STATUSES, status) ? status : "",
    sort: matches(SORTS, sort) ? sort : DEFAULT_BROWSE.sort,
    page,
  };
}

export function browseHref(
  params: BrowseParams,
  overrides: Partial<BrowseParams> = {},
): string {
  const merged = { ...params, ...overrides };
  const search = new URLSearchParams();

  if (merged.q.trim()) search.set("q", merged.q.trim());
  if (merged.genre) search.set("genre", merged.genre);
  if (merged.year) search.set("year", String(merged.year));
  if (merged.season) search.set("season", merged.season);
  if (merged.format) search.set("format", merged.format);
  if (merged.status) search.set("status", merged.status);
  if (merged.sort && merged.sort !== DEFAULT_BROWSE.sort) {
    search.set("sort", merged.sort);
  }
  if (merged.page > 1) search.set("page", String(merged.page));

  const query = search.toString();
  return query ? `/browse?${query}` : "/browse";
}

export function hasActiveFilters(params: BrowseParams): boolean {
  return Boolean(
    params.q ||
      params.genre ||
      params.year ||
      params.season ||
      params.format ||
      params.status ||
      params.sort !== DEFAULT_BROWSE.sort,
  );
}
