import Link from "next/link";

export default function MissionNotFound() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-3 px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">
        Mission not found
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        We could not find a mission with that id. It may have been removed or
        the link is incorrect.
      </p>
      <Link
        href="/missions"
        className="font-medium text-blue-600 underline-offset-4 hover:underline"
      >
        Back to missions
      </Link>
    </main>
  );
}
