"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_basic,
  tableFeatures,
  useTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  episodePageIndex,
  getEpisodeTitle,
  type EpisodeOrder,
} from "@/lib/episodes";
import type { Track } from "@/lib/zoko";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
} from "./icons";

const PAGE_SIZES = [10, 25, 50, 100];

const features = tableFeatures({
  rowPaginationFeature,
  rowSortingFeature,
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  sortFns: { basic: sortFn_basic },
});

type EpisodeFeatures = typeof features;

type EpisodeRow = {
  episode: number;
  title: string;
};

type Props = {
  mediaId: number;
  total: number;
  titles?: Record<number, string>;
  current?: number;
  track?: Track;
  onSelect?: (episode: number) => void;
};

export default function EpisodeTable({
  mediaId,
  total,
  titles = {},
  current,
  track = "sub",
  onSelect,
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "episode", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });

  const order: EpisodeOrder = sorting[0]?.desc ? "desc" : "asc";

  // ponytail: client-side rows; move to server pagination if counts get huge
  const data = useMemo(
    () =>
      Array.from({ length: Math.max(0, Math.floor(total) || 0) }, (_, index) => {
        const episode = index + 1;
        return { episode, title: getEpisodeTitle(titles, episode) };
      }),
    [total, titles],
  );

  useEffect(() => {
    if (!current) return;
    const pageIndex = episodePageIndex(
      total,
      pagination.pageSize,
      current,
      order,
    );
    setPagination((prev) =>
      prev.pageIndex === pageIndex ? prev : { ...prev, pageIndex },
    );
  }, [current, order, pagination.pageSize, total]);

  const columns = useMemo<ColumnDef<EpisodeFeatures, EpisodeRow>[]>(
    () => [
      {
        accessorKey: "episode",
        header: ({ column }) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 h-7 px-2"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Episode
            <ArrowUpDown className="size-3.5" />
          </Button>
        ),
        cell: ({ row }) => {
          const active = current === row.original.episode;
          const label = `Episode ${row.original.episode}: ${row.original.title}`;
          const actionClass =
            "absolute inset-0 z-10 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset";

          return (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-md text-[11px] font-bold",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {row.original.episode}
              </span>
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(row.original.episode)}
                  aria-current={active ? "true" : undefined}
                  className={actionClass}
                >
                  <span className="sr-only">{label}</span>
                </button>
              ) : (
                <Link
                  href={`/watch/${mediaId}/${row.original.episode}?track=${track}`}
                  aria-current={active ? "true" : undefined}
                  className={actionClass}
                >
                  <span className="sr-only">{label}</span>
                </Link>
              )}
            </div>
          );
        },
        sortFn: "basic",
      },
      {
        accessorKey: "title",
        header: "Title",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="min-w-0 flex-1 truncate" title={row.original.title}>
              {row.original.title}
            </span>
            {current === row.original.episode ? (
              <PlayIcon className="size-3 shrink-0 text-primary" />
            ) : null}
          </span>
        ),
      },
    ],
    [current, mediaId, onSelect, track],
  );

  const table = useTable({
    features,
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
  });

  const rowCount = table.getRowCount();
  const pageCount = Math.max(1, table.getPageCount());
  const pageIndex = table.state.pagination.pageIndex;
  const pageSize = table.state.pagination.pageSize;
  const start = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min(rowCount, (pageIndex + 1) * pageSize);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-muted-foreground">
          {total} {total === 1 ? "episode" : "episodes"}
        </span>
        <Select
          value={order}
          onValueChange={(value) =>
            setSorting([{ id: "episode", desc: value === "desc" }])
          }
        >
          <SelectTrigger
            size="sm"
            className="h-7 w-[112px] text-[11px]"
            aria-label="Episode order"
          >
            <SelectValue>
              {order === "desc" ? "Latest first" : "Oldest first"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="desc">Latest first</SelectItem>
            <SelectItem value="asc">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>
          {start}–{end} of {rowCount}
        </span>
        <div className="flex items-center gap-1">
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              const nextSize = Number(value);
              setPagination((prev) => ({
                pageIndex: Math.min(
                  prev.pageIndex,
                  Math.max(0, Math.ceil(rowCount / nextSize) - 1),
                ),
                pageSize: nextSize,
              }));
            }}
          >
            <SelectTrigger
              size="sm"
              className="h-6 w-[64px] text-[11px]"
              aria-label="Rows per page"
            >
              <SelectValue>{pageSize}</SelectValue>
            </SelectTrigger>
            <SelectContent side="top" align="end">
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Previous page</span>
            <ChevronLeftIcon />
          </Button>
          <span className="tabular-nums">
            {pageIndex + 1}/{pageCount}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Next page</span>
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
      <Table className="text-xs">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => {
              const active = current === row.original.episode;
              return (
                <TableRow
                  key={row.id}
                  data-state={active ? "selected" : undefined}
                  className="relative"
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === "title" ? "w-full max-w-0" : undefined
                      }
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No episodes listed yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
