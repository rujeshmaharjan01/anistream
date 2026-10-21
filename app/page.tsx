import ContinueRow from "@/components/continue-row";
import DataUnavailable from "@/components/data-unavailable";
import GenreChips from "@/components/genre-chips";
import Hero from "@/components/hero";
import MediaRow from "@/components/media-row";
import { getHomeData } from "@/lib/data";
import { currentSeason, seasonLabel } from "@/lib/format";

export const revalidate = 600;

export default async function HomePage() {
  const data = await getHomeData();

  if (!data) {
    return <DataUnavailable />;
  }

  const { season, year } = currentSeason();
  const recent = data.recent.airingSchedules.filter(
    (item) => item.media && !item.media.isAdult,
  );
  const recentEpisode = new Map(
    recent.map((item) => [item.media.id, item.episode]),
  );

  return (
    <>
      <Hero items={data.trending.media.slice(0, 5)} />

      <div className="container-page pb-16">
        <ContinueRow />

        <MediaRow
          title="Airing now"
          subtitle="Currently releasing episodes"
          items={data.airing.media}
          href="/browse?status=RELEASING"
        />

        <MediaRow
          title={`${seasonLabel(season)} ${year}`}
          subtitle="Popular picks from the current season"
          items={data.season.media}
          href={`/browse?season=${season}&year=${year}`}
        />

        <MediaRow
          title="Top rated"
          subtitle="The highest-scoring anime on AniList"
          items={data.top.media}
          href="/browse?sort=SCORE_DESC"
        />

        <MediaRow
          title="Latest episodes"
          subtitle="Freshly aired, newest first"
          items={recent.map((item) => item.media)}
          href="/schedule"
          badgeFor={(media) => {
            const episode = recentEpisode.get(media.id);
            return episode ? `EP ${episode}` : undefined;
          }}
        />

        <MediaRow
          title="Popular movies"
          subtitle="Feature films for one sitting"
          items={data.movies.media}
          href="/browse?format=MOVIE"
        />

        <GenreChips />
      </div>
    </>
  );
}
