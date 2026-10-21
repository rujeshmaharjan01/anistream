export type MediaTitle = {
  romaji: string;
  english?: string | null;
  native?: string | null;
};

export type MediaCover = {
  large: string;
  extraLarge?: string | null;
  color?: string | null;
};

export type FuzzyDate = {
  year?: number | null;
  month?: number | null;
  day?: number | null;
};

export type AiringEpisode = {
  episode: number;
  airingAt: number;
};

export type StreamingEpisode = {
  title: string;
  thumbnail?: string | null;
  url?: string | null;
  site?: string | null;
};

export type Media = {
  id: number;
  idMal?: number | null;
  title: MediaTitle;
  coverImage: MediaCover;
  bannerImage?: string | null;
  description?: string | null;
  format?: string | null;
  status?: string | null;
  episodes?: number | null;
  duration?: number | null;
  averageScore?: number | null;
  season?: string | null;
  seasonYear?: number | null;
  genres?: string[] | null;
  isAdult?: boolean | null;
  nextAiringEpisode?: AiringEpisode | null;
  streamingEpisodes?: StreamingEpisode[] | null;
  studios?: { nodes: { id: number; name: string }[] } | null;
  trailer?: { id?: string | null; site?: string | null } | null;
  relations?: {
    edges: { relationType?: string | null; node: Media }[];
  } | null;
  recommendations?: {
    nodes: { mediaRecommendation?: Media | null }[];
  } | null;
  startDate?: FuzzyDate | null;
  endDate?: FuzzyDate | null;
  source?: string | null;
  popularity?: number | null;
  favourites?: number | null;
};

export type PageInfo = {
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  total: number;
};

export type HomeData = {
  trending: { media: Media[] };
  season: { media: Media[] };
  top: { media: Media[] };
  airing: { media: Media[] };
  movies: { media: Media[] };
  recent: {
    airingSchedules: { airingAt: number; episode: number; media: Media }[];
  };
};

export type BrowseData = {
  Page: { media: Media[]; pageInfo: PageInfo };
};

export type DetailData = {
  Media: Media | null;
};

export type WatchData = {
  Media: Media | null;
};

export type ScheduleItem = {
  id: number;
  airingAt: number;
  episode: number;
  media: Media;
};

export type ScheduleData = {
  Page: {
    pageInfo: { hasNextPage: boolean };
    airingSchedules: ScheduleItem[];
  };
};

export type SearchSuggestion = {
  id: number;
  idMal?: number | null;
  title: MediaTitle;
  coverImage: { large: string; color?: string | null };
  format?: string | null;
  seasonYear?: number | null;
  averageScore?: number | null;
};

export type SearchData = {
  Page: { media: SearchSuggestion[] };
};

export type AzData = {
  Page: { pageInfo: { hasNextPage: boolean }; media: Media[] };
};
