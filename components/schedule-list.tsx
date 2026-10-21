"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ScheduleItem } from "@/lib/types";
import { formatLabel, titleOf } from "@/lib/format";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon } from "./icons";

function dayKey(epochMs: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(epochMs));
}

function dayLabel(epochMs: number, now: number): string {
  const target = dayKey(epochMs);
  const today = dayKey(now);
  const tomorrow = dayKey(now + 86_400_000);

  if (target === today) return "Today";
  if (target === tomorrow) return "Tomorrow";

  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(epochMs));
}

function timeLabel(epochMs: number): string {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(epochMs));
}

function relativeLabel(airingAt: number, now: number): string {
  const diff = airingAt * 1000 - now;
  const abs = Math.abs(diff);
  const minutes = Math.round(abs / 60_000);
  const hours = Math.round(abs / 3_600_000);
  const days = Math.round(abs / 86_400_000);
  const value =
    minutes < 60 ? `${Math.max(1, minutes)}m` : hours < 48 ? `${hours}h` : `${days}d`;
  return diff >= 0 ? `in ${value}` : `${value} ago`;
}

export default function ScheduleList({ items }: { items: ScheduleItem[] }) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    setMounted(true);
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();

    for (const item of [...items].sort((a, b) => a.airingAt - b.airingAt)) {
      const key = dayKey(item.airingAt * 1000);
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }

    return [...map.entries()];
  }, [items]);

  if (!mounted) {
    return (
      <div className="space-y-3" aria-hidden>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!groups.length) {
    return (
      <Empty className="border border-border bg-card/60 py-16">
        <EmptyMedia variant="icon">
          <CalendarIcon className="h-5 w-5" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No airings found</EmptyTitle>
          <EmptyDescription>
            The schedule could not be loaded right now. Try again in a minute.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map(([key, group]) => (
        <section key={key} aria-label={dayLabel(group[0].airingAt * 1000, now)}>
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">
              {dayLabel(group[0].airingAt * 1000, now)}
            </h2>
            <span className="text-xs text-muted-foreground">
              {group.length} {group.length === 1 ? "episode" : "episodes"}
            </span>
          </div>

          <div className="grid gap-2 lg:grid-cols-2">
            {group.map((item) => {
              const title = titleOf(item.media);

              return (
                <Card
                  key={item.id}
                  className="flex-row items-center gap-3 p-2.5 ring-border transition hover:ring-primary/35"
                >
                  <div className="w-14 shrink-0 text-center">
                    <p className="text-sm font-bold">
                      {timeLabel(item.airingAt * 1000)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {relativeLabel(item.airingAt, now)}
                    </p>
                  </div>

                  <Link href={`/anime/${item.media.id}`} className="shrink-0">
                    <img
                      src={item.media.coverImage?.large || "/placeholder.svg"}
                      alt=""
                      loading="lazy"
                      className="h-16 w-11 rounded-md object-cover"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/anime/${item.media.id}`}
                      className="line-clamp-2 text-sm font-semibold leading-snug text-foreground/90 transition hover:text-primary"
                    >
                      {title}
                    </Link>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Episode {item.episode} ·{" "}
                      {formatLabel(item.media.format)}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
