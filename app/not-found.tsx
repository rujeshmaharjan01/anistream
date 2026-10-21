import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-16">
      <div className="max-w-md text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          404
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
          This page slipped away
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The anime, episode, or page you asked for is not here. Try searching
          for a title instead.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/browse">
              <SearchIcon className="h-4 w-4" />
              Browse anime
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
