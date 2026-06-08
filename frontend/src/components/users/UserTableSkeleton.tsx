import { Skeleton } from '@/components/ui/skeleton'

export function UserTableSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          <Skeleton className="h-10 w-full max-w-sm rounded-md" />
          <Skeleton className="h-10 w-[120px] rounded-md" />
          <Skeleton className="h-10 w-[120px] rounded-md" />
        </div>
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-[100px] rounded-md" />
          ))}
        </div>
      </div>
      <div className="rounded-md border">
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-[10%] rounded" />
            ))}
          </div>
        </div>
        <div className="divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3 w-1/4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              </div>
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-4 w-[10%] rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
