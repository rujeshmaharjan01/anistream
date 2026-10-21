"use client";

import { useEffect, useState } from "react";
import {
  isInList,
  toggleList,
  type ListEntry,
} from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BookmarkFilledIcon, BookmarkIcon } from "./icons";

type Entry = Omit<ListEntry, "addedAt">;

export default function WatchlistButton({
  entry,
  className,
}: {
  entry: Entry;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSaved(isInList(entry.mediaId));
    setMounted(true);
  }, [entry.mediaId]);

  function handleClick() {
    setSaved(toggleList(entry));
  }

  return (
    <Button
      type="button"
      variant={saved ? "secondary" : "outline"}
      onClick={handleClick}
      aria-pressed={saved}
      className={cn("h-10 rounded-full px-5", className)}
    >
      {saved ? (
        <BookmarkFilledIcon className="h-4 w-4 text-primary" />
      ) : (
        <BookmarkIcon className="h-4 w-4" />
      )}
      {mounted && saved ? "In My List" : "Add to My List"}
    </Button>
  );
}
