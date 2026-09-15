export function MissionListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="h-14 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"
        />
      ))}
    </div>
  );
}
