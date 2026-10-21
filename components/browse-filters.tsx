"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FORMATS,
  GENRES,
  SEASONS,
  SORTS,
  STATUSES,
  yearOptions,
} from "@/lib/constants";
import {
  browseHref,
  hasActiveFilters,
  parseBrowseParams,
  type BrowseParams,
} from "@/lib/params";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon, XIcon } from "./icons";

const ALL = "all";
const ANY = "any";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function BrowseFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = parseBrowseParams(
    Object.fromEntries(searchParams.entries()),
  );
  const [query, setQuery] = useState(current.q);
  const years = yearOptions();

  useEffect(() => {
    setQuery(current.q);
  }, [current.q]);

  function update(overrides: Partial<BrowseParams>) {
    const next = { ...current, ...overrides, page: 1 };
    router.push(browseHref(next), { scroll: false });
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    update({ q: query.trim() });
  }

  function clearAll() {
    setQuery("");
    router.push(pathname);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Filters
        </h2>
        {hasActiveFilters(current) ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-7 gap-1 px-2 text-xs font-medium text-muted-foreground"
          >
            <XIcon className="h-3.5 w-3.5" />
            Clear all
          </Button>
        ) : null}
      </div>

      <form onSubmit={submitSearch}>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Field
            label="Search"
            className="sm:col-span-2 lg:col-span-3 xl:col-span-2"
          >
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Title, romaji, or keyword"
                aria-label="Search anime by title"
                className="h-10 rounded-xl border-border bg-secondary/40 pl-9 dark:bg-secondary/40"
              />
            </div>
          </Field>

          <Field label="Genre">
            <Select
              value={current.genre || ALL}
              onValueChange={(value) =>
                update({ genre: value === ALL ? "" : value })
              }
            >
              <SelectTrigger
                className="h-10 w-full rounded-xl border-border bg-secondary/40 dark:bg-secondary/40"
                aria-label="Filter by genre"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All genres</SelectItem>
                {GENRES.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Year">
            <Select
              value={current.year ? String(current.year) : ANY}
              onValueChange={(value) =>
                update({ year: value === ANY ? null : Number(value) })
              }
            >
              <SelectTrigger
                className="h-10 w-full rounded-xl border-border bg-secondary/40 dark:bg-secondary/40"
                aria-label="Filter by year"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any year</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Season">
            <Select
              value={current.season || ANY}
              onValueChange={(value) =>
                update({ season: value === ANY ? "" : value })
              }
            >
              <SelectTrigger
                className="h-10 w-full rounded-xl border-border bg-secondary/40 dark:bg-secondary/40"
                aria-label="Filter by season"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any season</SelectItem>
                {SEASONS.map((season) => (
                  <SelectItem key={season.value} value={season.value}>
                    {season.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Format">
            <Select
              value={current.format || ANY}
              onValueChange={(value) =>
                update({ format: value === ANY ? "" : value })
              }
            >
              <SelectTrigger
                className="h-10 w-full rounded-xl border-border bg-secondary/40 dark:bg-secondary/40"
                aria-label="Filter by format"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any format</SelectItem>
                {FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Status">
            <Select
              value={current.status || ANY}
              onValueChange={(value) =>
                update({ status: value === ANY ? "" : value })
              }
            >
              <SelectTrigger
                className="h-10 w-full rounded-xl border-border bg-secondary/40 dark:bg-secondary/40"
                aria-label="Filter by status"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any status</SelectItem>
                {STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Sort by">
            <Select
              value={current.sort}
              onValueChange={(value) => update({ sort: value })}
            >
              <SelectTrigger
                className="h-10 w-full rounded-xl border-border bg-secondary/40 dark:bg-secondary/40"
                aria-label="Sort results"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((sort) => (
                  <SelectItem key={sort.value} value={sort.value}>
                    {sort.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </form>
    </div>
  );
}
