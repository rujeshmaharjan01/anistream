import type { Metadata } from "next";
import DataUnavailable from "@/components/data-unavailable";
import ScheduleList from "@/components/schedule-list";
import { CalendarIcon } from "@/components/icons";
import { getScheduleData } from "@/lib/data";

export const metadata: Metadata = {
  title: "Airing schedule",
  description: "See what airs over the next seven days, in your local time.",
};

export const revalidate = 900;

export default async function SchedulePage() {
  const items = await getScheduleData();

  if (!items) {
    return (
      <DataUnavailable
        title="Schedule is taking a break"
        message="AniList did not answer. The schedule is cached for 15 minutes, so a retry shortly should fill it in."
      />
    );
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <header className="mb-7">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          <CalendarIcon className="h-4 w-4" />
          Next 7 days
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Airing schedule
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Times are shown in your local timezone. Ongoing shows only, newest
          airings first.
        </p>
      </header>

      <ScheduleList items={items} />
    </div>
  );
}
