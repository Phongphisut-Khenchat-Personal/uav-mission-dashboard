import Link from "next/link";
import { MissionForm } from "@/components/forms/MissionForm";

export default function NewMissionPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-6 overflow-x-hidden px-6 py-10">
      <div>
        <Link
          href="/missions"
          className="font-medium text-blue-600 underline-offset-4 hover:underline"
        >
          Back to missions
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Create mission
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Add a new UAV mission. Nothing is stored permanently in this mock
          form.
        </p>
      </div>

      <MissionForm cancelHref="/missions" />
    </main>
  );
}
