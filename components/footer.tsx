import Link from "next/link";
import { NAV, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { PlayIcon } from "./icons";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-fuchsia-500 text-primary-foreground">
              <PlayIcon className="h-4 w-4 translate-x-px" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              Ani<span className="text-primary">Stream</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {SITE_TAGLINE} Browse thousands of series and films, keep your place,
            and pick up where you left off.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Explore
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-foreground/80 transition hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            About
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {SITE_NAME} does not host or upload any video. Playback is provided
            by third-party services. Anime metadata is supplied by AniList.
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. For demonstration and
            personal use.
          </p>
          <p>Built with Next.js · Metadata by AniList · Player by Zokoanime</p>
        </div>
      </div>
    </footer>
  );
}
