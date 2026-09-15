import { Suspense } from "react";
import Link from "next/link";
import { MissionList } from "@/components/missions/MissionList";
import { MissionListSkeleton } from "@/components/missions/MissionListSkeleton";

export default function MissionsPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-3 overflow-x-hidden px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Missions</h1>
        <Link
          href="/missions/new"
          className="font-medium text-blue-600 underline-offset-4 hover:underline"
        >
          Create mission
        </Link>
      </div>

      <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
        Review planned, in-progress, completed, and failed UAV missions from a
        single list.
      </p>

      <Suspense fallback={<MissionListSkeleton />}>
        <MissionList />
      </Suspense>
    </main>
  );
}
