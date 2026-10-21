import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page py-10" aria-label="Loading">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <Skeleton className="mt-3 h-4 w-72" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }, (_, index) => (
          <div key={index}>
            <Skeleton className="aspect-[2/3] rounded-xl" />
            <Skeleton className="mt-2 h-3 w-4/5" />
            <Skeleton className="mt-1.5 h-2.5 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
