"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Media } from "@/lib/types";
import { getEpisodeTitle } from "@/lib/episodes";
import {
  formatClock,
  progressPercent,
  titleOf,
} from "@/lib/format";
import {
  markWatched,
  saveProgress,
  setPreferredTrack,
} from "@/lib/storage";
import { ZOKO_ORIGIN, zokoUrl, type Track } from "@/lib/zoko";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import EpisodeTable from "./episode-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MaximizeIcon,
  PlayIcon,
} from "./icons";

type Props = {
  media: Media;
  initialEpisode: number;
  initialTrack: Track;
  total: number;
  titles: Record<number, string>;
};

type PlayerMessage = {
  channel?: string;
  type?: string;
  position?: number;
  duration?: number;
  currentTime?: number;
  auto_next?: boolean;
  request?: "enter" | "exit";
  reason?: string;
  message?: string;
};

export default function WatchClient({
  media,
  initialEpisode,
  initialTrack,
  total,
  titles,
}: Props) {
  const [episode, setEpisode] = useState(initialEpisode);
  const [track, setTrack] = useState(initialTrack);
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastSaveRef = useRef(0);
  const lastKnownRef = useRef({ position: 0, duration: 0 });

  const mediaTitle = titleOf(media);
  const episodeTitle = getEpisodeTitle(titles, episode);
  const cover = media.coverImage?.large ?? "";
  const src = zokoUrl(media, episode, track, { retry });

  const updateUrl = useCallback(
    (nextEpisode: number, nextTrack: Track) => {
      window.history.replaceState(
        null,
        "",
        `/watch/${media.id}/${nextEpisode}?track=${nextTrack}`,
      );
    },
    [media.id],
  );

  const goToEpisode = useCallback(
    (next: number, options: { scroll?: boolean } = {}) => {
      const clamped = Math.min(Math.max(1, Math.floor(next) || 1), total);
      setEpisode(clamped);
      setError(null);
      updateUrl(clamped, track);

      if (options.scroll !== false) {
        wrapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [total, track, updateUrl],
  );

  const changeTrack = useCallback(
    (next: Track) => {
      if (next === track) return;
      setTrack(next);
      setPreferredTrack(next);
      setError(null);
      updateUrl(episode, next);
    },
    [episode, track, updateUrl],
  );

  const reportFullscreen = useCallback(() => {
    const wrap = wrapRef.current;
    const frame = iframeRef.current;
    if (!wrap || !frame?.contentWindow) return;

    frame.contentWindow.postMessage(
      {
        channel: "zokoanime",
        type: "fullscreen",
        active: document.fullscreenElement === wrap,
      },
      ZOKO_ORIGIN,
    );
  }, []);

  const handleFullscreenRequest = useCallback(
    (request: "enter" | "exit") => {
      const wrap = wrapRef.current;
      if (!wrap) return;

      if (request === "enter") {
        if (document.fullscreenElement !== wrap) {
          wrap
            .requestFullscreen()
            .then(reportFullscreen, reportFullscreen);
        }
      } else if (document.fullscreenElement) {
        document.exitFullscreen().then(reportFullscreen, reportFullscreen);
      }
    },
    [reportFullscreen],
  );

  const toggleFullscreen = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    if (document.fullscreenElement === wrap) {
      document.exitFullscreen().then(reportFullscreen, reportFullscreen);
    } else {
      wrap.requestFullscreen().then(reportFullscreen, reportFullscreen);
    }
  }, [reportFullscreen]);

  useEffect(() => {
    document.title = `${mediaTitle} · Episode ${episode} · AniStream`;
  }, [mediaTitle, episode]);

  useEffect(() => {
    const onChange = () => reportFullscreen();
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [reportFullscreen]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== ZOKO_ORIGIN) return;
      const message = event.data as PlayerMessage;
      if (!message || message.channel !== "zokoanime") return;

      function persist(
        currentTime: number,
        knownDuration: number,
        force = false,
      ) {
        if (!Number.isFinite(currentTime) || currentTime < 0) return;
        lastKnownRef.current = {
          position: currentTime,
          duration: knownDuration,
        };
        setPosition(currentTime);
        setDuration(knownDuration);

        const now = Date.now();
        if (!force && now - lastSaveRef.current < 4_000) return;
        if (currentTime < 5 || knownDuration <= 0) return;
        lastSaveRef.current = now;

        saveProgress({
          mediaId: media.id,
          title: mediaTitle,
          cover,
          episode,
          total,
          position: currentTime,
          duration: knownDuration,
          track,
          updatedAt: now,
        });
      }

      switch (message.type) {
        case "ready": {
          setError(null);
          reportFullscreen();
          break;
        }
        case "time": {
          persist(
            Number(message.position ?? 0),
            Number(message.duration ?? 0),
          );
          break;
        }
        case "watching-log": {
          persist(
            Number(message.currentTime ?? 0),
            Number(message.duration ?? 0),
          );
          break;
        }
        case "seeked": {
          persist(
            Number(message.position ?? 0),
            Number(message.duration ?? 0),
            true,
          );
          break;
        }
        case "ended": {
          const finishedDuration =
            Number(message.duration ?? 0) || lastKnownRef.current.duration;
          markWatched(media.id, episode);
          saveProgress({
            mediaId: media.id,
            title: mediaTitle,
            cover,
            episode,
            total,
            position: finishedDuration,
            duration: finishedDuration,
            track,
            updatedAt: Date.now(),
          });

          if (message.auto_next && episode < total) {
            goToEpisode(episode + 1, { scroll: false });
          }
          break;
        }
        case "complete": {
          markWatched(media.id, episode);
          break;
        }
        case "error": {
          setError(
            message.reason === "sandboxed"
              ? "The player refused to start inside a sandboxed frame."
              : message.message ||
                  "This episode could not be played. Try the other track or reload.",
          );
          break;
        }
        case "fullscreen": {
          if (message.request) handleFullscreenRequest(message.request);
          else reportFullscreen();
          break;
        }
        default:
          break;
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    cover,
    episode,
    goToEpisode,
    handleFullscreenRequest,
    media.id,
    mediaTitle,
    reportFullscreen,
    total,
    track,
  ]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      switch (event.key.toLowerCase()) {
        case "n":
          if (episode < total) {
            event.preventDefault();
            goToEpisode(episode + 1);
          }
          break;
        case "p":
          if (episode > 1) {
            event.preventDefault();
            goToEpisode(episode - 1);
          }
          break;
        case "f":
          event.preventDefault();
          toggleFullscreen();
          break;
        case "s":
          changeTrack("sub");
          break;
        case "d":
          changeTrack("dub");
          break;
        case "?":
          setShowHelp((value) => !value);
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [changeTrack, episode, goToEpisode, toggleFullscreen, total]);

  const percent = progressPercent(position, duration);
  const isMovie = media.format === "MOVIE";

  return (
    <div className="container-page py-6 lg:py-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div
            ref={wrapRef}
            className="relative scroll-mt-20 overflow-hidden rounded-2xl border border-border bg-black shadow-2xl shadow-black/50"
          >
            <div className="relative aspect-video">
              <iframe
                ref={iframeRef}
                src={src}
                title={`${mediaTitle} — ${isMovie ? "movie" : `episode ${episode}`}`}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                onLoad={reportFullscreen}
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>

          {error ? (
            <Alert
              variant="destructive"
              className="mt-3 border-destructive/30 bg-destructive/10"
            >
              <AlertTitle>Playback error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    setRetry((value) => value + 1);
                  }}
                  className="h-7 rounded-full border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  Reload
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => changeTrack(track === "sub" ? "dub" : "sub")}
                  className="h-7 rounded-full border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  Try {track === "sub" ? "dub" : "sub"}
                </Button>
              </div>
            </Alert>
          ) : null}

          <Progress value={percent} className="mt-2 h-1" />

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button
              asChild
              variant="link"
              size="sm"
              className="h-auto gap-1 p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Link href={`/anime/${media.id}`}>
                <ChevronLeftIcon className="h-4 w-4" />
                Back to details
              </Link>
            </Button>
            <span aria-hidden className="text-border">
              /
            </span>
            <span className="text-xs text-muted-foreground">
              {isMovie ? "Movie" : `Episode ${episode} of ${total}`}
            </span>
          </div>

          <h1 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            {mediaTitle}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isMovie ? "Full movie" : `Episode ${episode}: ${episodeTitle}`}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <ToggleGroup
              type="single"
              value={track}
              onValueChange={(value) => {
                if (value === "sub" || value === "dub") changeTrack(value);
              }}
              className="rounded-full border border-border bg-card p-1"
              aria-label="Audio track"
            >
              {(["sub", "dub"] as const).map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  className="rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {value}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => goToEpisode(episode - 1)}
              disabled={episode <= 1}
              className="h-8 rounded-full"
              aria-label="Previous episode"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => goToEpisode(episode + 1)}
              disabled={episode >= total}
              className="h-8 rounded-full"
              aria-label="Next episode"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="rounded-full"
                  aria-label="Toggle fullscreen"
                >
                  <MaximizeIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fullscreen</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowHelp(true)}
                  className="rounded-full"
                  aria-label="Keyboard shortcuts"
                >
                  ?
                </Button>
              </TooltipTrigger>
              <TooltipContent>Shortcuts</TooltipContent>
            </Tooltip>

            <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Auto-next
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {formatClock(position)} / {formatClock(duration)}
            </span>
            <span>
              Playback by Zokoanime · Episode unavailable? Try the other track.
            </span>
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card className="gap-0 overflow-hidden ring-border [--card-spacing:0]">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-bold">Episodes</h2>
              <Badge
                variant="secondary"
                className="text-[10px] text-muted-foreground"
              >
                {total}
              </Badge>
            </div>
            <ScrollArea className="max-h-[65vh] lg:max-h-[calc(100vh-12rem)]">
              <div className="p-2.5">
                <EpisodeTable
                  mediaId={media.id}
                  total={total}
                  titles={titles}
                  current={episode}
                  track={track}
                  onSelect={goToEpisode}
                />
              </div>
            </ScrollArea>
          </Card>

          <div className="mt-3 rounded-xl border border-border bg-card/60 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
            Intro and outro skipping is enabled. Progress is saved on this
            device. The player does not run inside a sandboxed iframe.
          </div>
        </aside>
      </div>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>
              Available when focus is outside the player and inputs.
            </DialogDescription>
          </DialogHeader>

          <dl className="space-y-2.5 text-sm">
            {[
              ["N", "Next episode"],
              ["P", "Previous episode"],
              ["F", "Toggle fullscreen"],
              ["S", "Switch to sub"],
              ["D", "Switch to dub"],
              ["?", "Toggle this dialog"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">{label}</dt>
                <dd>
                  <Kbd>{key}</Kbd>
                </dd>
              </div>
            ))}
          </dl>

          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <PlayIcon className="h-3 w-3" />
            Arrow keys seek inside the player once it has focus.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
