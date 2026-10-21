"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, SITE_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MenuIcon, PlayIcon, SearchIcon, XIcon } from "./icons";
import SearchBox from "./search-box";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center gap-3">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label={`${SITE_NAME} home`}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-fuchsia-500 text-primary-foreground shadow-lg shadow-primary/25">
            <PlayIcon className="h-4 w-4 translate-x-px" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Ani<span className="text-primary">Stream</span>
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="ml-4 hidden items-center gap-0.5 lg:flex"
        >
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Button
                key={item.href}
                asChild
                variant={active ? "secondary" : "ghost"}
                size="sm"
                className="h-9 rounded-full px-3.5"
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            );
          })}
        </nav>

        <div className="ml-auto hidden w-72 md:block xl:w-80">
          <SearchBox />
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchOpen((current) => !current);
                setMenuOpen(false);
              }}
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
              className="ml-auto rounded-full border border-border bg-secondary/60 md:hidden"
            >
              {searchOpen ? (
                <XIcon className="h-4 w-4" />
              ) : (
                <SearchIcon className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search</TooltipContent>
        </Tooltip>

        <Sheet
          open={menuOpen}
          onOpenChange={(open) => {
            setMenuOpen(open);
            if (open) setSearchOpen(false);
          }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="rounded-full border border-border bg-secondary/60 lg:hidden"
              >
                <MenuIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Menu</TooltipContent>
          </Tooltip>

          <SheetContent side="right" className="w-[85%] sm:max-w-sm">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav aria-label="Mobile navigation" className="px-4">
              <div className="flex flex-col gap-1">
                {NAV.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <Button
                      key={item.href}
                      asChild
                      variant={active ? "secondary" : "ghost"}
                      className="h-auto w-full justify-between rounded-xl px-4 py-3.5 text-base font-semibold"
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.label}
                        <span aria-hidden className="text-primary">
                          →
                        </span>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {searchOpen ? (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <SearchBox
            id="mobile-search"
            autoFocus
            onDone={() => setSearchOpen(false)}
          />
        </div>
      ) : null}
    </header>
  );
}
