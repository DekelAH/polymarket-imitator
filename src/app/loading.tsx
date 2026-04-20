import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-3/4" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-8" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
            <div className="border-t border-border pt-2">
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
