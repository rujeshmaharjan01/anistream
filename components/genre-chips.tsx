import Link from "next/link";
import { GENRES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "./icons";

export default function GenreChips() {
  return (
    <section className="mt-12" aria-labelledby="genre-heading">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2
            id="genre-heading"
            className="text-xl font-bold tracking-tight sm:text-2xl"
          >
            Browse by genre
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Find something that fits the mood.
          </p>
        </div>
        <Button
          asChild
          variant="link"
          size="sm"
          className="h-auto shrink-0 p-0 text-xs font-semibold text-muted-foreground hover:text-primary sm:text-sm"
        >
          <Link href="/browse">
            All anime
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre) => (
          <Button
            key={genre}
            asChild
            variant="outline"
            size="sm"
            className="h-9 rounded-full border-border bg-card px-3.5 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-foreground dark:bg-card dark:hover:bg-primary/10"
          >
            <Link href={`/browse?genre=${encodeURIComponent(genre)}`}>
              {genre}
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}
