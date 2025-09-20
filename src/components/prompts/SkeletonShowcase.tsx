import { Skeleton } from "@/components/ui";

export default function SkeletonShowcase() {
  return (
    <div className="space-y-[var(--space-4)]">
      <div className="space-y-[var(--space-2)]">
        <Skeleton
          ariaHidden={false}
          role="status"
          aria-label="Loading primary title"
          className="h-[var(--space-6)] w-2/5 sm:w-1/3"
          radius="card"
        />
        <Skeleton className="w-full" />
        <Skeleton className="w-5/6" />
      </div>
      <div className="flex items-center gap-[var(--space-3)]">
        <Skeleton className="h-[var(--space-8)] w-12 flex-none" radius="full" />
        <div className="flex-1 space-y-[var(--space-2)]">
          <Skeleton className="w-3/4" />
          <Skeleton className="w-2/3" />
        </div>
      </div>
    </div>
  );
}
