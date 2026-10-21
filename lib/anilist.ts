const ANILIST_API = "https://graphql.anilist.co";
const MAX_CACHE_ENTRIES = 400;

type CacheEntry = { at: number; data: unknown };
type AniListResponse<T> = {
  data?: T;
  errors?: { message?: string }[];
};

const globalStore = globalThis as typeof globalThis & {
  __anistreamAniListCache?: Map<string, CacheEntry>;
};

const cache =
  globalStore.__anistreamAniListCache ?? new Map<string, CacheEntry>();
globalStore.__anistreamAniListCache = cache;

export async function anilist<T>(
  query: string,
  variables: Record<string, unknown> = {},
  ttlMs = 5 * 60_000,
): Promise<T | null> {
  const key = `${query}\n${JSON.stringify(variables)}`;
  const cached = cache.get(key);

  if (cached && Date.now() - cached.at < ttlMs) {
    return cached.data as T;
  }

  try {
    const response = await fetch(ANILIST_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(12_000),
      cache: "no-store",
    });

    if (!response.ok) {
      return cached ? (cached.data as T) : null;
    }

    const json = (await response.json()) as AniListResponse<T>;

    if (!json.data || json.errors?.length) {
      return cached ? (cached.data as T) : null;
    }

    if (cache.size > MAX_CACHE_ENTRIES) cache.clear();
    cache.set(key, { at: Date.now(), data: json.data });

    return json.data;
  } catch {
    return cached ? (cached.data as T) : null;
  }
}
