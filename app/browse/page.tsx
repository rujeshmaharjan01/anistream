import { Suspense } from "react";
import type { Metadata } from "next";
import BrowseFilters from "@/components/browse-filters";
import MediaCard from "@/components/media-card";
import Pagination from "@/components/pagination";
import { getBrowseData } from "@/lib/data";
import { parseBrowseParams } from "@/lib/params";
import { formatLabel, seasonLabel } from "@/lib/format";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Browse anime",
  description: "Filter thousands of anime by genre, year, season, format, and score.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BrowsePage({ searchParams }: Props) {
  const params = parseBrowseParams(await searchParams);
  const data = await getBrowseData(params);
  const media = data?.Page.media ?? [];
  const pageInfo = data?.Page.pageInfo;

  const heading = params.q
    ? `Results for “${params.q}”`
    : params.genre
      ? `${params.genre} anime`
      : "Browse anime";

  const context = [
    params.season ? seasonLabel(params.season) : null,
    params.year,
    params.format ? formatLabel(params.format) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="container-page py-8 sm:py-10">
      <header className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          Catalog
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {heading}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {context ? `${context} · ` : ""}
          {pageInfo
            ? `${pageInfo.total.toLocaleString()} titles`
            : "Filters update as you go"}
        </p>
      </header>

      <Suspense fallback={<Skeleton className="h-40 rounded-2xl" />}>
        <BrowseFilters />
      </Suspense>

      {media.length ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {media.map((item, index) => (
            <MediaCard key={item.id} media={item} priority={index < 6} />
          ))}
        </div>
      ) : (
        <Empty className="mt-6 border border-border bg-card/60 py-20">
          <EmptyHeader>
            <EmptyTitle className="text-lg font-semibold">
              No titles found
            </EmptyTitle>
            <EmptyDescription>
              Try a shorter search, remove a filter, or change the year. AniList
              only returns titles it knows about.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {pageInfo ? (
        <Pagination
          params={params}
          page={pageInfo.currentPage}
          lastPage={pageInfo.lastPage}
          total={pageInfo.total}
        />
      ) : null}
    </div>
  );
}
