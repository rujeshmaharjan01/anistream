import { describe, expect, test } from "bun:test";
import {
  episodePage,
  episodePageIndex,
  getEpisodeCount,
  getEpisodeTitle,
  getEpisodeTitles,
  parseEpisodeTitle,
} from "../lib/episodes";
import {
  currentSeason,
  formatClock,
  positiveInt,
  progressPercent,
  stripHtml,
} from "../lib/format";
import { browseHref, parseBrowseParams } from "../lib/params";
import { zokoUrl } from "../lib/zoko";

describe("episodes", () => {
  test("uses the aired count for an ongoing show", () => {
    expect(
      getEpisodeCount({
        episodes: null,
        nextAiringEpisode: { episode: 5, airingAt: 0 },
        streamingEpisodes: null,
        format: "TV",
      }),
    ).toBe(4);
  });

  test("prefers the announced episode count", () => {
    expect(
      getEpisodeCount({
        episodes: 24,
        nextAiringEpisode: { episode: 5, airingAt: 0 },
        streamingEpisodes: null,
        format: "TV",
      }),
    ).toBe(24);
  });

  test("parses numbered streaming titles", () => {
    expect(parseEpisodeTitle("Episode 3 - The Journey")).toEqual({
      number: 3,
      title: "The Journey",
    });
    expect(parseEpisodeTitle("Episode 12")).toEqual({
      number: 12,
      title: "Episode 12",
    });
  });

  test("builds a title map and falls back for missing episodes", () => {
    const titles = getEpisodeTitles({
      streamingEpisodes: [
        { title: "Episode 1 - Start" },
        { title: "Episode 2 - Middle" },
      ],
    });
    expect(titles).toEqual({ 1: "Start", 2: "Middle" });
    expect(getEpisodeTitle(titles, 9)).toBe("Episode 9");
  });

  test("pages ascending and descending episode ranges", () => {
    expect(episodePage(25, 100, 0, "asc")).toEqual({
      start: 1,
      end: 25,
      episodes: Array.from({ length: 25 }, (_, index) => index + 1),
      pageCount: 1,
      safePage: 0,
    });

    expect(episodePage(120, 50, 0, "desc")).toMatchObject({
      start: 71,
      end: 120,
      pageCount: 3,
      safePage: 0,
    });
    expect(episodePage(120, 50, 0, "desc").episodes[0]).toBe(120);
    expect(episodePage(120, 50, 0, "desc").episodes.at(-1)).toBe(71);
    expect(episodePage(120, 50, 2, "desc").episodes).toEqual(
      Array.from({ length: 20 }, (_, index) => 20 - index),
    );
  });

  test("finds the page containing an episode in either order", () => {
    expect(episodePageIndex(120, 50, 1, "asc")).toBe(0);
    expect(episodePageIndex(120, 50, 51, "asc")).toBe(1);
    expect(episodePageIndex(120, 50, 120, "asc")).toBe(2);
    expect(episodePageIndex(120, 50, 120, "desc")).toBe(0);
    expect(episodePageIndex(120, 50, 71, "desc")).toBe(0);
    expect(episodePageIndex(120, 50, 70, "desc")).toBe(1);
  });
});

describe("format", () => {
  test("strips tags and decodes entities", () => {
    expect(stripHtml("<p>Hello &amp; welcome</p><br>Next")).toBe(
      "Hello & welcome\n\nNext",
    );
  });

  test("formats clocks and progress", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(65)).toBe("1:05");
    expect(formatClock(3725)).toBe("1:02:05");
    expect(progressPercent(50, 200)).toBe(25);
    expect(progressPercent(0, 0)).toBe(0);
  });

  test("parses positive integers with a fallback", () => {
    expect(positiveInt("12")).toBe(12);
    expect(positiveInt("nope")).toBe(1);
    expect(positiveInt(-4)).toBe(1);
  });

  test("reports the current season", () => {
    expect(currentSeason(new Date(2026, 9, 21))).toEqual({
      season: "FALL",
      year: 2026,
    });
    expect(currentSeason(new Date(2026, 0, 5)).season).toBe("WINTER");
  });
});

describe("browse params", () => {
  test("drops invalid filters and clamps pages", () => {
    const params = parseBrowseParams({
      genre: "Not A Genre",
      season: "SPRING",
      year: "2024",
      page: "9999",
    });
    expect(params.genre).toBe("");
    expect(params.season).toBe("SPRING");
    expect(params.year).toBe(2024);
    expect(params.page).toBe(500);
  });

  test("builds a compact URL", () => {
    const params = parseBrowseParams({ genre: "Action" });
    expect(browseHref(params)).toBe("/browse?genre=Action");
    expect(browseHref(params, { page: 2 })).toBe(
      "/browse?genre=Action&page=2",
    );
  });
});

describe("zoko", () => {
  test("prefers the MAL id and includes player options", () => {
    expect(zokoUrl({ id: 16498, idMal: 16498 }, 3, "dub")).toBe(
      "https://zokoanime.video/stream/mal/16498/3/dub?color=8b5cf6&autonext=1&asi=1",
    );
  });

  test("falls back to the AniList id and supports retry", () => {
    expect(
      zokoUrl({ id: 999, idMal: null }, 1, "sub", { retry: 2 }),
    ).toBe(
      "https://zokoanime.video/stream/anilist/999/1/sub?color=8b5cf6&autonext=1&asi=1&_r=2",
    );
  });
});
