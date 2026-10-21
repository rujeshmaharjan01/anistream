import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WatchClient from "@/components/watch-client";
import { getWatchMedia } from "@/lib/data";
import { getEpisodeCount, getEpisodeTitles } from "@/lib/episodes";
import { positiveInt, stripHtml, titleOf } from "@/lib/format";
import type { Track } from "@/lib/zoko";

type Props = {
  params: Promise<{ id: string; episode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const media = await getWatchMedia(Number((await params).id));
  if (!media) return { title: "Anime not found" };

  return {
    title: `Watch ${titleOf(media)}`,
    description: stripHtml(media.description).slice(0, 160) || undefined,
    robots: { index: false },
  };
}

export default async function WatchPage({ params, searchParams }: Props) {
  const [{ id, episode }, query] = await Promise.all([params, searchParams]);
  const media = await getWatchMedia(Number(id));
  if (!media) notFound();

  const total = getEpisodeCount(media);
  const currentEpisode = positiveInt(episode, 1);
  if (currentEpisode > total) notFound();

  const rawTrack = Array.isArray(query.track) ? query.track[0] : query.track;
  const initialTrack: Track = rawTrack === "dub" ? "dub" : "sub";

  return (
    <WatchClient
      media={media}
      initialEpisode={currentEpisode}
      initialTrack={initialTrack}
      total={total}
      titles={getEpisodeTitles(media)}
    />
  );
}
