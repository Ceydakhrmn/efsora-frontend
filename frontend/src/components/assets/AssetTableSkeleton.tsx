import { Skeleton } from '@/components/ui/skeleton'

export function AssetTableSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          <Skeleton className="h-10 w-full max-w-sm rounded-md" />
          <Skeleton className="h-10 w-[130px] rounded-md" />
          <Skeleton className="h-10 w-[130px] rounded-md" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-[100px] rounded-md" />
          ))}
        </div>
      </div>
      <div className="rounded-md border bg-card">
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-[10%] rounded" />
            ))}
          </div>
        </div>
        <div className="divide-y">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-4">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="flex flex-col gap-2 w-[12%]">
                  <Skeleton className="h-4 w-full rounded" />
                  {j === 0 && <Skeleton className="h-3 w-3/4 rounded" />}
                </div>
              ))}
              <div className="flex justify-end gap-2 w-[10%]">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
