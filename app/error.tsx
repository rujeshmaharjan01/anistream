"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-16">
      <div className="max-w-md text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          Something broke
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
          Could not load this page
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          AniList or the network did not answer. The cache may still have data,
          so a retry often works.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
