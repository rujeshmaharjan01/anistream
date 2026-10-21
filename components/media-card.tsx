import Link from "next/link";
import type { Media } from "@/lib/types";
import {
  formatLabel,
  scoreOf,
  titleOf,
  yearOf,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PlayIcon, StarIcon } from "./icons";

type Props = {
  media: Media;
  badge?: string;
  priority?: boolean;
  className?: string;
};

export default function MediaCard({
  media,
  badge,
  priority = false,
  className,
}: Props) {
  const title = titleOf(media);
  const year = yearOf(media);
  const score = scoreOf(media);
  const meta = [year, formatLabel(media.format)].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/anime/${media.id}`}
      className={cn(
        "group relative block rounded-xl outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring",
        className,
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border/60 bg-secondary shadow-lg shadow-black/30">
        <img
          src={media.coverImage?.large || "/placeholder.svg"}
          alt={title}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04] group-hover:brightness-[0.72]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/20" />

        <Badge
          variant="outline"
          className="absolute left-2 top-2 h-auto rounded-md border-border/40 bg-background/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground/90 backdrop-blur"
        >
          {badge ?? formatLabel(media.format)}
        </Badge>

        {score ? (
          <Badge
            variant="outline"
            className="absolute right-2 top-2 h-auto gap-1 rounded-md border-border/40 bg-background/70 px-1.5 py-0.5 text-[10px] font-bold text-primary backdrop-blur"
          >
            <StarIcon className="h-2.5 w-2.5" />
            {score}
          </Badge>
        ) : null}

        <span className="absolute inset-0 grid place-items-center opacity-0 transition duration-300 group-hover:opacity-100">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/90 text-primary-foreground shadow-xl shadow-black/40">
            <PlayIcon className="h-4 w-4 translate-x-px" />
          </span>
        </span>

        <span className="absolute inset-x-0 bottom-0 translate-y-2 px-2.5 pb-2 text-[11px] font-medium text-foreground/80 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {meta}
        </span>
      </div>

      <h3 className="mt-2.5 line-clamp-2 text-[13px] font-semibold leading-snug text-foreground/90 transition group-hover:text-foreground sm:text-sm">
        {title}
      </h3>
      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
        {meta || "Anime"}
      </p>
    </Link>
  );
}
