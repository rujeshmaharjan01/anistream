"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchSuggestion } from "@/lib/types";
import { formatLabel, titleOf, yearOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { SearchIcon, XIcon } from "./icons";

type Props = {
  id?: string;
  autoFocus?: boolean;
  className?: string;
  onDone?: () => void;
};

type SearchResponse = { results?: SearchSuggestion[] };

export default function SearchBox({
  id = "site-search",
  autoFocus,
  className,
  onDone,
}: Props) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const value = query.trim();

    if (value.length < 2) {
      setResults([]);
      setLoading(false);
      setActive(-1);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(value)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Search failed");
        const data = (await response.json()) as SearchResponse;
        setResults(Array.isArray(data.results) ? data.results : []);
        setOpen(true);
        setActive(-1);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handlePointer(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, []);

  function goToAnime(mediaId: number) {
    setOpen(false);
    setQuery("");
    onDone?.();
    router.push(`/anime/${mediaId}`);
  }

  function submit() {
    if (active >= 0 && results[active]) {
      goToAnime(results[active].id);
      return;
    }

    const value = query.trim();
    if (!value) return;
    setOpen(false);
    onDone?.();
    router.push(`/browse?q=${encodeURIComponent(value)}`);
  }

  const listId = `${id}-results`;
  const showPanel = open && query.trim().length >= 2;

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="relative flex items-center">
          <SearchIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            id={id}
            type="search"
            value={query}
            autoFocus={autoFocus}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (query.trim().length >= 2) setOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setOpen(true);
                setActive((current) =>
                  results.length ? (current + 1) % results.length : -1,
                );
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((current) =>
                  results.length
                    ? (current - 1 + results.length) % results.length
                    : -1,
                );
              } else if (event.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder="Search anime…"
            aria-label="Search anime"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-activedescendant={
              active >= 0 ? `${id}-option-${active}` : undefined
            }
            className="h-10 rounded-full border-border bg-secondary/60 pl-10 pr-10 focus-visible:bg-accent dark:bg-secondary/60 dark:focus-visible:bg-accent"
          />
          {query ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setQuery("");
                setResults([]);
                setOpen(false);
              }}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full text-muted-foreground"
            >
              <XIcon className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      </form>

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl shadow-black/60"
        >
          {loading && results.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground">
              <Spinner className="h-4 w-4" />
              Searching…
            </div>
          ) : null}

          {!loading && results.length === 0 ? (
            <div className="px-4 py-4 text-sm text-muted-foreground">
              No matches. Press Enter to search the full catalog.
            </div>
          ) : null}

          {results.map((media, index) => {
            const title = titleOf(media);
            const meta = [yearOf(media), formatLabel(media.format)]
              .filter(Boolean)
              .join(" · ");

            return (
              <button
                key={media.id}
                type="button"
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={active === index}
                onMouseEnter={() => setActive(index)}
                onClick={() => goToAnime(media.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left transition",
                  active === index ? "bg-accent" : "hover:bg-accent/60",
                )}
              >
                <img
                  src={media.coverImage?.large || "/placeholder.svg"}
                  alt=""
                  className="h-14 w-10 shrink-0 rounded-md object-cover"
                  loading="lazy"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {meta || "Anime"}
                  </span>
                </span>
                {media.averageScore ? (
                  <span className="shrink-0 text-xs font-semibold text-primary">
                    {media.averageScore}%
                  </span>
                ) : null}
              </button>
            );
          })}

          {results.length > 0 ? (
            <div className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
              Enter to search the full catalog
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
