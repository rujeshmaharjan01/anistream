import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DataUnavailable({
  title = "Catalog is taking a break",
  message = "AniList did not answer. This is usually temporary. Retry in a moment or browse again.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="container-page grid min-h-[55vh] place-items-center py-16">
      <div className="max-w-md text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          Upstream unavailable
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>
        <Button asChild className="mt-7 h-10 rounded-full px-5">
          <Link href="/">Try again</Link>
        </Button>
      </div>
    </div>
  );
}
