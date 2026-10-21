"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getContinueList,
  STORAGE_UPDATE_EVENT,
  type ProgressEntry,
} from "@/lib/storage";
import { progressPercent, timeAgo } from "@/lib/format";
import { Progress } from "@/components/ui/progress";
import { ClockIcon } from "./icons";

export default function ContinueRow() {
  const [items, setItems] = useState<ProgressEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const load = () => setItems(getContinueList());
    load();
    setMounted(true);

    window.addEventListener(STORAGE_UPDATE_EVENT, load);
    window.addEventListener("storage", load);
    window.addEventListener("focus", load);

    return () => {
      window.removeEventListener(STORAGE_UPDATE_EVENT, load);
      window.removeEventListener("storage", load);
      window.removeEventListener("focus", load);
    };
  }, []);

  if (!mounted || !items.length) return null;

  return (
    <section className="mt-10 sm:mt-12" aria-labelledby="continue-heading">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2
            id="continue-heading"
            className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl"
          >
            <ClockIcon className="h-5 w-5 text-primary" />
            Continue watching
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick up where you left off.
          </p>
        </div>
        <Link
          href="/library"
          className="shrink-0 text-xs font-semibold text-muted-foreground transition hover:text-primary sm:text-sm"
        >
          My list
        </Link>
      </div>

      <div className="row-scroll continue-row -mx-1 px-1">
        {items.slice(0, 12).map((entry) => {
          const percent = progressPercent(entry.position, entry.duration);

          return (
            <Link
              key={entry.mediaId}
              href={`/watch/${entry.mediaId}/${entry.episode}?track=${entry.track}`}
              className="group flex gap-3 rounded-xl border border-border bg-card p-2.5 transition hover:border-primary/40 hover:bg-secondary"
            >
              <img
                src={entry.cover || "/placeholder.svg"}
                alt=""
                loading="lazy"
                className="h-24 w-16 shrink-0 rounded-lg object-cover"
              />
              <span className="flex min-w-0 flex-1 flex-col justify-center">
                <span className="line-clamp-2 text-sm font-semibold leading-snug text-foreground/90 transition group-hover:text-foreground">
                  {entry.title}
                </span>
                <span className="mt-1 text-[11px] text-muted-foreground">
                  Episode {entry.episode}
                  {entry.total > 1 ? ` of ${entry.total}` : ""}
                </span>
                <Progress value={percent} className="mt-2 h-1" />
                <span className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{percent}% watched</span>
                  <span>{timeAgo(entry.updatedAt)}</span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
