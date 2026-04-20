import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-4xl w-full py-4 sm:py-6 flex flex-col gap-4 sm:gap-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shrink-0" />
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
            <Skeleton className="h-4 w-1/2" />
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2 sm:gap-3">
                  <Skeleton className="h-3 w-20 sm:w-28 shrink-0" />
                  <Skeleton className="h-1.5 flex-1 min-w-0 rounded-full" />
                  <Skeleton className="h-3 w-10 shrink-0" />
                </div>
              ))}
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
