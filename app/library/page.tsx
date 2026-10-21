import type { Metadata } from "next";
import LibraryClient from "@/components/library-client";

export const metadata: Metadata = {
  title: "My list",
  description: "Your saved anime and continue-watching progress on this device.",
};

export default function LibraryPage() {
  return (
    <div className="container-page py-8 sm:py-10">
      <header className="mb-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          Your device
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          My list
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Saved titles and playback progress live in this browser only. No
          account, no sync, no server copy.
        </p>
      </header>

      <LibraryClient />
    </div>
  );
}
