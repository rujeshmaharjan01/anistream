export const SITE_NAME = "AniStream";
export const SITE_TAGLINE = "Anime, without the clutter.";
export const SITE_DESCRIPTION =
  "Browse trending, airing, and classic anime, then stream episodes in sub or dub from one clean place.";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/schedule", label: "Schedule" },
  { href: "/az", label: "A–Z" },
  { href: "/library", label: "My List" },
] as const;

export const GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Ecchi",
  "Fantasy",
  "Horror",
  "Mahou Shoujo",
  "Mecha",
  "Music",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
] as const;

export const SEASONS = [
  { value: "WINTER", label: "Winter" },
  { value: "SPRING", label: "Spring" },
  { value: "SUMMER", label: "Summer" },
  { value: "FALL", label: "Fall" },
] as const;

export const FORMATS = [
  { value: "TV", label: "TV" },
  { value: "TV_SHORT", label: "TV Short" },
  { value: "MOVIE", label: "Movie" },
  { value: "OVA", label: "OVA" },
  { value: "ONA", label: "ONA" },
  { value: "SPECIAL", label: "Special" },
  { value: "MUSIC", label: "Music" },
] as const;

export const STATUSES = [
  { value: "RELEASING", label: "Airing" },
  { value: "FINISHED", label: "Finished" },
  { value: "NOT_YET_RELEASED", label: "Upcoming" },
  { value: "HIATUS", label: "Hiatus" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export const SORTS = [
  { value: "POPULARITY_DESC", label: "Most popular" },
  { value: "TRENDING_DESC", label: "Trending" },
  { value: "SCORE_DESC", label: "Highest rated" },
  { value: "START_DATE_DESC", label: "Newest" },
  { value: "FAVOURITES_DESC", label: "Most favorited" },
  { value: "TITLE_ROMAJI", label: "Title A–Z" },
] as const;

export const TRACKS = [
  { value: "sub", label: "Sub" },
  { value: "dub", label: "Dub" },
] as const;

export const PAGE_SIZE = 30;

export function yearOptions(now = new Date().getFullYear()): number[] {
  return Array.from({ length: now - 1958 }, (_, index) => now + 1 - index);
}
