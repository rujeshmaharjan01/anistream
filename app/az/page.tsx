import type { Metadata } from "next";
import Link from "next/link";
import DataUnavailable from "@/components/data-unavailable";
import MediaCard from "@/components/media-card";
import { getAzResults } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export const metadata: Metadata = {
  title: "A–Z index",
  description: "Jump to popular anime by the first letter of the title.",
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AzPage({ searchParams }: Props) {
  const query = await searchParams;
  const raw = Array.isArray(query.letter) ? query.letter[0] : query.letter;
  const letter = raw?.trim().toUpperCase().slice(0, 1) ?? "";
  const active = /^[A-Z]$/.test(letter) ? letter : "A";

  const results = await getAzResults(active);
  if (!results) {
    return (
      <DataUnavailable
        title="A–Z is taking a break"
        message="AniList did not answer, so the popular catalog sample could not be loaded. Retry in a moment."
      />
    );
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          Index
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Anime A–Z
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Popular titles by first letter. AniList has no prefix search, so this
          index scans a large popular catalog and filters it locally.
        </p>
      </header>

      <nav
        aria-label="Jump to letter"
        className="mt-6 flex flex-wrap gap-1.5"
      >
        {LETTERS.map((value) => (
          <Button
            key={value}
            asChild
            variant={value === active ? "default" : "outline"}
            size="icon-lg"
            className="rounded-lg text-xs font-bold"
          >
            <Link
              href={`/az?letter=${value}`}
              aria-current={value === active ? "page" : undefined}
            >
              {value}
            </Link>
          </Button>
        ))}
      </nav>

      <div className="mt-7 flex items-baseline justify-between gap-4 border-b border-border pb-3">
        <h2 className="text-lg font-bold">
          {active}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {results.length} {results.length === 1 ? "title" : "titles"}
          </span>
        </h2>
        <span className="text-[11px] text-muted-foreground">Popular catalog sample</span>
      </div>

      {results.length ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {results.map((media, index) => (
            <MediaCard key={media.id} media={media} priority={index < 6} />
          ))}
        </div>
      ) : (
        <Empty className="mt-5 border border-border bg-card/60 py-20">
          <EmptyHeader>
            <EmptyTitle className="text-lg font-semibold">
              No popular titles here
            </EmptyTitle>
            <EmptyDescription>
              Nothing starting with {active} made it into the popular catalog
              sample. Try another letter or use search.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild className="mt-1">
            <Link href="/browse">Browse everything</Link>
          </Button>
        </Empty>
      )}
    </div>
  );
}
