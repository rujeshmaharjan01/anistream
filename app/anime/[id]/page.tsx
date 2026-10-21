import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DetailActions from "@/components/detail-actions";
import EpisodeTable from "@/components/episode-table";
import MediaRow from "@/components/media-row";
import { ExternalLinkIcon, StarIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getMedia } from "@/lib/data";
import { getEpisodeCount, getEpisodeTitles } from "@/lib/episodes";
import {
  dateLabel,
  episodesLabel,
  formatLabel,
  runtimeLabel,
  scoreOf,
  seasonLabel,
  secondaryTitle,
  statusLabel,
  stripHtml,
  titleOf,
  yearOf,
} from "@/lib/format";
import type { Media } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

function uniqueMedia(items: (Media | null | undefined)[]): Media[] {
  const seen = new Set<number>();
  return items.filter((item): item is Media => {
    if (!item || item.isAdult || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const media = await getMedia(Number((await params).id));
  if (!media) return { title: "Anime not found" };

  return {
    title: titleOf(media),
    description: stripHtml(media.description).slice(0, 160) || undefined,
  };
}

export default async function AnimeDetailPage({ params }: Props) {
  const media = await getMedia(Number((await params).id));
  if (!media) notFound();

  const title = titleOf(media);
  const secondary = secondaryTitle(media);
  const year = yearOf(media);
  const score = scoreOf(media);
  const synopsis = stripHtml(media.description);
  const total = getEpisodeCount(media);
  const titles = getEpisodeTitles(media);
  const studios = media.studios?.nodes.map((studio) => studio.name) ?? [];
  const banner =
    media.bannerImage ||
    media.coverImage?.extraLarge ||
    media.coverImage?.large ||
    "/placeholder.svg";
  const trailer =
    media.trailer?.site === "youtube" && media.trailer.id
      ? `https://www.youtube.com/watch?v=${media.trailer.id}`
      : null;

  const related = uniqueMedia(
    media.relations?.edges.map((edge) => edge.node) ?? [],
  ).slice(0, 14);
  const recommendations = uniqueMedia(
    media.recommendations?.nodes.map((node) => node.mediaRecommendation) ?? [],
  ).slice(0, 14);

  const facts = [
    ["Format", formatLabel(media.format)],
    ["Episodes", episodesLabel(media)],
    ["Status", statusLabel(media.status)],
    [
      "Season",
      [seasonLabel(media.season), year].filter(Boolean).join(" ") || null,
    ],
    ["Runtime", runtimeLabel(media.duration)],
    ["Started", dateLabel(media.startDate)],
    ["Studio", studios.join(", ") || null],
    ["Source", media.source ? media.source.replaceAll("_", " ") : null],
  ].filter((fact): fact is [string, string] => Boolean(fact[1]));

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 h-[560px] overflow-hidden">
          <img
            src={banner}
            alt=""
            aria-hidden
            fetchPriority="high"
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/60" />
        </div>

        <div className="container-page pb-12 pt-10 sm:pt-16">
          <div className="grid gap-7 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)]">
            <div className="mx-auto w-40 shrink-0 sm:w-48 md:mx-0 md:w-full">
              <img
                src={media.coverImage?.large || "/placeholder.svg"}
                alt={`${title} cover`}
                className="aspect-[2/3] w-full rounded-2xl border border-border object-cover shadow-2xl shadow-black/60"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                <span>{formatLabel(media.format)}</span>
                {media.status ? (
                  <>
                    <span className="text-border">/</span>
                    <span className="text-muted-foreground">{statusLabel(media.status)}</span>
                  </>
                ) : null}
              </div>

              <h1 className="mt-3 text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {title}
              </h1>
              {secondary ? (
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">{secondary}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                {score ? (
                  <Badge
                    variant="outline"
                    className="h-6 gap-1 border-primary/30 bg-primary/10 px-2.5 font-bold text-primary"
                  >
                    <StarIcon className="h-3 w-3" />
                    {score}%
                  </Badge>
                ) : null}
                {year ? (
                  <Badge
                    variant="secondary"
                    className="h-6 px-2.5 text-foreground/80"
                  >
                    {year}
                  </Badge>
                ) : null}
                <Badge
                  variant="secondary"
                  className="h-6 px-2.5 text-foreground/80"
                >
                  {episodesLabel(media)}
                </Badge>
                {runtimeLabel(media.duration) ? (
                  <Badge
                    variant="secondary"
                    className="h-6 px-2.5 text-foreground/80"
                  >
                    {runtimeLabel(media.duration)}
                  </Badge>
                ) : null}
                {media.popularity ? (
                  <Badge
                    variant="secondary"
                    className="h-6 px-2.5 text-foreground/80"
                  >
                    {media.popularity.toLocaleString()} followers
                  </Badge>
                ) : null}
              </div>

              {media.genres?.length ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {media.genres.map((genre) => (
                    <Badge
                      key={genre}
                      asChild
                      variant="secondary"
                      className="h-6 px-3 text-[11px] hover:bg-primary/15 hover:text-primary"
                    >
                      <Link href={`/browse?genre=${encodeURIComponent(genre)}`}>
                        {genre}
                      </Link>
                    </Badge>
                  ))}
                </div>
              ) : null}

              <DetailActions media={media} />

              {trailer ? (
                <a
                  href={trailer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-primary"
                >
                  Watch trailer on YouTube
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Synopsis</h2>
              {synopsis ? (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/70">
                  {synopsis}
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No synopsis is available for this title yet.
                </p>
              )}
            </div>

            <Card className="p-4 ring-border">
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Details
              </h2>
              <dl className="mt-3 space-y-2.5 text-sm">
                {facts.map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <dt className="shrink-0 text-muted-foreground">{label}</dt>
                    <dd className="text-right font-medium capitalize text-foreground/85">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </div>
      </section>

      <div className="container-page pb-16">
        <section aria-labelledby="episodes-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="episodes-heading"
                className="text-xl font-bold tracking-tight sm:text-2xl"
              >
                Episodes
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {media.format === "MOVIE"
                  ? "Play the full movie in sub or dub."
                  : `All ${total} episodes, sub and dub where available.`}
              </p>
            </div>
            <Button asChild>
              <Link href={`/watch/${media.id}/1?track=sub`}>
                Start watching
              </Link>
            </Button>
          </div>

          <Card className="mt-5 p-3 ring-border sm:p-4">
            <EpisodeTable
              mediaId={media.id}
              total={total}
              titles={titles}
              track="sub"
            />
          </Card>
        </section>

        {related.length ? (
          <MediaRow title="Related" subtitle="Sequels, prequels, and side stories" items={related} />
        ) : null}

        {recommendations.length ? (
          <MediaRow
            title="You might also like"
            subtitle="Based on AniList recommendations"
            items={recommendations}
          />
        ) : null}
      </div>
    </>
  );
}
