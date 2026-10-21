"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  clearProgress,
  getContinueList,
  getList,
  removeFromList,
  removeProgress,
  STORAGE_UPDATE_EVENT,
  type ListEntry,
  type ProgressEntry,
} from "@/lib/storage";
import {
  formatLabel,
  progressPercent,
  timeAgo,
} from "@/lib/format";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookmarkIcon,
  ClockIcon,
  PlayIcon,
  TrashIcon,
} from "./icons";

type Tab = "continue" | "list";

export default function LibraryClient() {
  const [tab, setTab] = useState<Tab>("continue");
  const [continueItems, setContinueItems] = useState<ProgressEntry[]>([]);
  const [listItems, setListItems] = useState<ListEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const refresh = useCallback(() => {
    setContinueItems(getContinueList());
    setListItems(getList());
  }, []);

  useEffect(() => {
    setMounted(true);
    refresh();

    window.addEventListener(STORAGE_UPDATE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(STORAGE_UPDATE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  function clearHistory() {
    clearProgress();
    refresh();
    setConfirmClear(false);
  }

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList className="h-auto w-fit rounded-full border border-border bg-card p-1">
          <TabsTrigger
            value="continue"
            className="gap-1.5 rounded-full px-4 py-2 text-sm font-semibold data-active:bg-primary data-active:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground"
          >
            <ClockIcon className="h-4 w-4" />
            Continue
            {mounted ? (
              <Badge
                variant="secondary"
                className="h-4 px-1.5 text-[10px] text-muted-foreground"
              >
                {continueItems.length}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger
            value="list"
            className="gap-1.5 rounded-full px-4 py-2 text-sm font-semibold data-active:bg-primary data-active:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground"
          >
            <BookmarkIcon className="h-4 w-4" />
            My List
            {mounted ? (
              <Badge
                variant="secondary"
                className="h-4 px-1.5 text-[10px] text-muted-foreground"
              >
                {listItems.length}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        {tab === "continue" && continueItems.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmClear(true)}
            className="h-7 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-destructive"
          >
            <TrashIcon className="h-3.5 w-3.5" />
            Clear history
          </Button>
        ) : null}
      </div>

      <TabsContent value="continue" className="mt-6">
        {continueItems.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {continueItems.map((entry) => {
              const percent = progressPercent(entry.position, entry.duration);

              return (
                <Card
                  key={entry.mediaId}
                  className="flex-row gap-3 p-3 ring-border"
                >
                  <Link
                    href={`/watch/${entry.mediaId}/${entry.episode}?track=${entry.track}`}
                    className="shrink-0"
                  >
                    <img
                      src={entry.cover || "/placeholder.svg"}
                      alt=""
                      loading="lazy"
                      className="h-28 w-20 rounded-lg object-cover"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={`/watch/${entry.mediaId}/${entry.episode}?track=${entry.track}`}
                      className="line-clamp-2 text-sm font-semibold leading-snug transition hover:text-primary"
                    >
                      {entry.title}
                    </Link>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Episode {entry.episode}
                      {entry.total > 1 ? ` of ${entry.total}` : ""} ·{" "}
                      {entry.track === "dub" ? "Dub" : "Sub"} ·{" "}
                      {timeAgo(entry.updatedAt)}
                    </p>

                    <div className="mt-auto pt-3">
                      <Progress value={percent} className="h-1" />
                      <div className="mt-2 flex items-center justify-between">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1.5 rounded-full bg-primary/15 px-3 text-xs font-semibold text-primary hover:bg-primary/25"
                        >
                          <Link
                            href={`/watch/${entry.mediaId}/${entry.episode}?track=${entry.track}`}
                          >
                            <PlayIcon className="h-3 w-3" />
                            Resume
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            removeProgress(entry.mediaId);
                            refresh();
                          }}
                          aria-label={`Remove ${entry.title} from continue watching`}
                          className="rounded-full text-muted-foreground hover:text-destructive"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<ClockIcon className="h-5 w-5" />}
            title="Nothing in progress"
            message="Start an episode and your place will show up here."
            href="/browse"
            action="Browse anime"
          />
        )}
      </TabsContent>

      <TabsContent value="list" className="mt-6">
        {listItems.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {listItems.map((entry) => (
              <article key={entry.mediaId} className="group relative">
                <Link
                  href={`/anime/${entry.mediaId}`}
                  className="block overflow-hidden rounded-xl border border-border/60 bg-secondary"
                >
                  <img
                    src={entry.cover || "/placeholder.svg"}
                    alt={entry.title}
                    loading="lazy"
                    className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:brightness-75"
                  />
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    removeFromList(entry.mediaId);
                    refresh();
                  }}
                  aria-label={`Remove ${entry.title} from My List`}
                  className="absolute right-2 top-2 rounded-full border border-border/60 bg-background/70 text-foreground/80 opacity-0 backdrop-blur transition hover:text-destructive group-hover:opacity-100"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </Button>
                <Link href={`/anime/${entry.mediaId}`}>
                  <h3 className="mt-2 line-clamp-2 text-xs font-semibold leading-snug transition group-hover:text-primary">
                    {entry.title}
                  </h3>
                </Link>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {[entry.year, formatLabel(entry.format)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BookmarkIcon className="h-5 w-5" />}
            title="Your list is empty"
            message="Save something for later with the bookmark button on any anime."
            href="/browse"
            action="Find anime"
          />
        )}
      </TabsContent>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <TrashIcon className="h-5 w-5 text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Clear watch history?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes all continue-watching progress from this browser.
              Saved list items are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearHistory} variant="destructive">
              Clear history
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Tabs>
  );
}

function EmptyState({
  icon,
  title,
  message,
  href,
  action,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  href: string;
  action: string;
}) {
  return (
    <Empty className="mt-6 border border-border bg-card/60 py-16">
      <EmptyMedia variant="icon">{icon}</EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild className="h-9 rounded-full px-5">
          <Link href={href}>{action}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
