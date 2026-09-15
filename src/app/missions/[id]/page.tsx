"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MissionChart } from "@/components/missions/MissionChart";
import { MissionStatusBadge } from "@/components/missions/MissionStatusBadge";
import { TelemetryPanel } from "@/components/missions/TelemetryPanel";
import type { Mission } from "@/types/mission";

interface MissionResponse {
  data: Mission;
}

function getDurationInMinutes(mission: Mission): number {
  const milliseconds =
    new Date(mission.endTime).getTime() -
    new Date(mission.startTime).getTime();

  return Math.round(milliseconds / 60_000);
}

export default function MissionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  const loadMission = useCallback(async () => {
    try {
      const response = await fetch(`/api/missions/${id}`);

      if (response.status === 404) {
        setIsNotFound(true);
        setMission(null);
        setError(null);
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

  if (error || !mission) {
    return (
      <main className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-3 px-6 py-10">
        <p>{error ?? "Unable to load mission"}</p>
        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setError(null);
            void loadMission();
          }}
          className="w-fit rounded-lg border px-3 py-2 text-sm font-medium"
        >
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-6 overflow-x-hidden px-6 py-10">
      <div className="flex flex-wrap gap-4">
        <Link
          href="/missions"
          className="font-medium text-blue-600 underline-offset-4 hover:underline"
        >
          Back to missions
        </Link>
        <Link
          href={`/missions/${mission.id}/edit`}
          className="font-medium text-blue-600 underline-offset-4 hover:underline"
        >
          Edit mission
        </Link>
      </div>

      <header className="flex flex-col gap-3">
        <p className="font-mono text-sm text-zinc-500">{mission.code}</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            {mission.name}
          </h1>
          <MissionStatusBadge status={mission.status} />
        </div>
      </header>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500">Drone</dt>
          <dd>{mission.droneName}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Start time</dt>
          <dd>{new Date(mission.startTime).toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">End time</dt>
          <dd>{new Date(mission.endTime).toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Duration</dt>
          <dd>{getDurationInMinutes(mission)} min</dd>
        </div>
      </dl>

      <section>
        <h2 className="text-lg font-semibold">Notes</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {mission.notes}
        </p>
      </section>

      {mission.status === "in-progress" && mission.telemetryHistory.at(-1) ? (
        <TelemetryPanel initialTelemetry={mission.telemetryHistory.at(-1)} />
      ) : null}

      <section>
        <h2 className="text-lg font-semibold">Battery over time</h2>
        <div className="mt-3">
          <MissionChart telemetryHistory={mission.telemetryHistory} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Waypoints</h2>
        <div className="mt-3 overflow-x-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-900">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Point
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Latitude
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Longitude
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {mission.waypoints.map((waypoint, index) => (
                <tr key={waypoint.id}>
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-mono">
                    {waypoint.latitude.toFixed(6)}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {waypoint.longitude.toFixed(6)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
