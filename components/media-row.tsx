import Link from "next/link";
import type { Media } from "@/lib/types";
import { Button } from "@/components/ui/button";
import MediaCard from "./media-card";
import { ChevronRightIcon } from "./icons";

type Props = {
  title: string;
  subtitle?: string;
  items: Media[];
  href?: string;
  badgeFor?: (media: Media) => string | undefined;
};

export default function MediaRow({
  title,
  subtitle,
  items,
  href,
  badgeFor,
}: Props) {
  if (!items?.length) return null;

  return (
    <section className="mt-10 sm:mt-12" aria-labelledby={`row-${slug(title)}`}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2
            id={`row-${slug(title)}`}
            className="text-xl font-bold tracking-tight sm:text-2xl"
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {href ? (
          <Button
            asChild
            variant="link"
            size="sm"
            className="h-auto shrink-0 p-0 text-xs font-semibold text-muted-foreground hover:text-primary sm:text-sm"
          >
            <Link href={href}>
              View all
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="row-scroll -mx-1 px-1">
        {items.map((media, index) => (
          <MediaCard
            key={`${media.id}-${index}`}
            media={media}
            badge={badgeFor?.(media)}
          />
        ))}
      </div>
    </section>
  );
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
