"use client";

import Link from "next/link";
import { useState } from "react";
import type { Media } from "@/lib/types";
import {
  episodesLabel,
  formatLabel,
  scoreOf,
  secondaryTitle,
  stripHtml,
  titleOf,
  yearOf,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  StarIcon,
} from "./icons";

export default function Hero({ items }: { items: Media[] }) {
  const [index, setIndex] = useState(0);

  if (!items.length) return null;

  const safeIndex = Math.min(index, items.length - 1);
  const media = items[safeIndex];
  const title = titleOf(media);
  const secondary = secondaryTitle(media);
  const year = yearOf(media);
  const score = scoreOf(media);
  const genres = (media.genres ?? []).slice(0, 3);
  const synopsis = stripHtml(media.description);

  function move(direction: number) {
    setIndex((current) => (current + direction + items.length) % items.length);
  }

  return (
    <section
      className="relative isolate overflow-hidden border-b border-border"
      aria-label="Featured anime"
    >
      <div className="absolute inset-0 -z-10 bg-background">
        {items.map((item, itemIndex) => (
          <img
            key={item.id}
            src={
              item.bannerImage ||
              item.coverImage?.extraLarge ||
              item.coverImage?.large ||
              "/placeholder.svg"
            }
            alt=""
            aria-hidden
            fetchPriority={itemIndex === safeIndex ? "high" : "low"}
            loading={itemIndex === safeIndex ? "eager" : "lazy"}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
              itemIndex === safeIndex ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/60" />
      </div>

      <div className="container-page flex min-h-[66vh] flex-col justify-end pb-10 pt-24 sm:min-h-[72vh] sm:pb-14 sm:pt-28">
        <div
          key={media.id}
          className="max-w-2xl animate-fade-up"
          aria-live="polite"
        >
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_2px] shadow-primary/60" />
            Trending now
          </p>

          <h1 className="mt-4 text-balance text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {secondary ? (
            <p className="mt-2 truncate text-sm text-muted-foreground sm:text-base">
              {secondary}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-foreground/80">
            {score ? (
              <Badge
                variant="outline"
                className="h-auto gap-1 border-primary/30 bg-primary/10 px-2.5 py-1 font-bold text-primary"
              >
                <StarIcon className="h-3 w-3" />
                {score}%
              </Badge>
            ) : null}
            {year ? (
              <Badge
                variant="outline"
                className="h-auto border-border/70 bg-background/40 px-2.5 py-1 text-foreground/80"
              >
                {year}
              </Badge>
            ) : null}
            <Badge
              variant="outline"
              className="h-auto border-border/70 bg-background/40 px-2.5 py-1 text-foreground/80"
            >
              {formatLabel(media.format)}
            </Badge>
            <Badge
              variant="outline"
              className="h-auto border-border/70 bg-background/40 px-2.5 py-1 text-foreground/80"
            >
              {episodesLabel(media)}
            </Badge>
          </div>

          {genres.length ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {genres.join(" · ")}
            </p>
          ) : null}

          {synopsis ? (
            <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-relaxed text-foreground/70 sm:text-[15px]">
              {synopsis}
            </p>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button asChild className="h-10 rounded-full px-5">
              <Link href={`/watch/${media.id}/1?track=sub`}>
                <PlayIcon className="h-4 w-4" />
                Watch now
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-full border-border bg-background/40 px-5 dark:bg-background/40 dark:hover:bg-accent"
            >
              <Link href={`/anime/${media.id}`}>
                More details
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between gap-6">
          <div
            className="flex items-center gap-2"
            role="tablist"
            aria-label="Featured titles"
          >
            {items.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={itemIndex === safeIndex}
                aria-label={`Show ${titleOf(item)}`}
                onClick={() => setIndex(itemIndex)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  itemIndex === safeIndex
                    ? "w-8 bg-primary"
                    : "w-3 bg-foreground/25 hover:bg-foreground/40",
                )}
              />
            ))}
          </div>

          {items.length > 1 ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => move(-1)}
                aria-label="Previous featured anime"
                className="rounded-full border-border/70 bg-background/30 backdrop-blur dark:bg-background/30"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => move(1)}
                aria-label="Next featured anime"
                className="rounded-full border-border/70 bg-background/30 backdrop-blur dark:bg-background/30"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
