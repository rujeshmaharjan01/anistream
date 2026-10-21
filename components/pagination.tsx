import Link from "next/link";
import { browseHref, type BrowseParams } from "@/lib/params";
import { Button } from "@/components/ui/button";
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

type Props = {
  params: BrowseParams;
  page: number;
  lastPage: number;
  total: number;
};

export default function Pagination({ params, page, lastPage, total }: Props) {
  if (!Number.isFinite(lastPage) || lastPage <= 1) return null;

  const current = Math.min(Math.max(page, 1), lastPage);
  const start = Math.max(1, Math.min(current - 2, lastPage - 4));
  const end = Math.min(lastPage, start + 4);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        {total.toLocaleString()} titles · page {current} of {lastPage}
      </p>

      <PaginationRoot
        aria-label="Pagination"
        className="mx-0 w-auto justify-start"
      >
        <PaginationContent>
          <PaginationItem>
            {current > 1 ? (
              <Button
                asChild
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                <Link
                  href={browseHref(params, { page: current - 1 })}
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                disabled
                aria-label="Previous page"
                className="rounded-full opacity-40"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
            )}
          </PaginationItem>

          {pages.map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <Button
                asChild
                variant={pageNumber === current ? "default" : "outline"}
                size="icon"
                className="rounded-full text-xs font-semibold"
              >
                <Link
                  href={browseHref(params, { page: pageNumber })}
                  aria-current={pageNumber === current ? "page" : undefined}
                >
                  {pageNumber}
                </Link>
              </Button>
            </PaginationItem>
          ))}

          <PaginationItem>
            {current < lastPage ? (
              <Button
                asChild
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                <Link
                  href={browseHref(params, { page: current + 1 })}
                  aria-label="Next page"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                disabled
                aria-label="Next page"
                className="rounded-full opacity-40"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            )}
          </PaginationItem>
        </PaginationContent>
      </PaginationRoot>
    </div>
  );
}
