"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MissionForm } from "@/components/forms/MissionForm";
import type { Mission } from "@/types/mission";

interface MissionResponse {
  data: Mission;
}

export default function EditMissionPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMission = useCallback(async () => {
    try {
      const response = await fetch(`/api/missions/${id}`);

      if (response.status === 404) {
        setIsNotFound(true);
        setMission(null);
        return;
      }

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Unable to load mission");
      }

      const payload = (await response.json()) as MissionResponse;
      setMission(payload.data);
      setIsNotFound(false);
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to load mission",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    async function loadOnMount() {
      await loadMission();
    }

    void loadOnMount();
  }, [loadMission]);

  if (isLoading) {
    return (
      <main className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-3 px-6 py-10">
        <p>Loading mission...</p>
      </main>
    );
  }

  if (isNotFound) {
    return (
      <main className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-3 px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          Mission not found
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          We could not find a mission to edit.
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

  if (error || !mission) {
    return (
      <main className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-3 px-6 py-10">
        <p>{error ?? "Unable to load mission"}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-6 overflow-x-hidden px-6 py-10">
      <div>
        <Link
          href={`/missions/${mission.id}`}
          className="font-medium text-blue-600 underline-offset-4 hover:underline"
        >
          Back to mission
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Edit {mission.code}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Changes in this mock form are not stored after refresh.
        </p>
      </div>

      <MissionForm
        initialMission={mission}
        cancelHref={`/missions/${mission.id}`}
      />
    </main>
  );
}
