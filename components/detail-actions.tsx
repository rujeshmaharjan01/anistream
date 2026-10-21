"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Media } from "@/lib/types";
import {
  getProgress,
  type ProgressEntry,
} from "@/lib/storage";
import { progressPercent, titleOf } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "./icons";
import WatchlistButton from "./watchlist-button";

export default function DetailActions({ media }: { media: Media }) {
  const [progress, setProgress] = useState<ProgressEntry | null>(null);

  useEffect(() => {
    setProgress(getProgress(media.id));

    const refresh = () => setProgress(getProgress(media.id));
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [media.id]);

  const episode = progress?.episode ?? 1;
  const track = progress?.track ?? "sub";
  const isMovie = media.format === "MOVIE";
  const percent = progress
    ? progressPercent(progress.position, progress.duration)
    : 0;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild className="h-10 rounded-full px-5">
          <Link href={`/watch/${media.id}/${episode}?track=${track}`}>
            <PlayIcon className="h-4 w-4" />
            {progress
              ? isMovie
                ? "Resume movie"
                : `Resume episode ${episode}`
              : isMovie
                ? "Watch movie"
                : "Watch episode 1"}
          </Link>
        </Button>
        <WatchlistButton
          entry={{
            mediaId: media.id,
            title: titleOf(media),
            cover: media.coverImage?.large ?? "",
            format: media.format,
            year: media.seasonYear,
            score: media.averageScore,
          }}
        />
      </div>

      {progress ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {percent}% watched · {isMovie ? "Movie" : `Episode ${progress.episode}`}{" "}
          on {progress.track === "dub" ? "dub" : "sub"}
        </p>
      ) : null}
    </div>
  );
}
