"use client";

import Link from "next/link";
import { MissionStatusBadge } from "@/components/missions/MissionStatusBadge";
import type { Mission } from "@/types/mission";

export type DateSortDirection = "asc" | "desc";

interface MissionTableProps {
  missions: Mission[];
  dateSortDirection: DateSortDirection;
  onToggleDateSort: () => void;
}

function getDurationInMinutes(mission: Mission): number {
  const milliseconds =
    new Date(mission.endTime).getTime() -
    new Date(mission.startTime).getTime();

  return Math.round(milliseconds / 60_000);
}

export function MissionTable({
  missions,
  dateSortDirection,
  onToggleDateSort,
}: MissionTableProps) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        <button
          type="button"
          onClick={onToggleDateSort}
          className="justify-self-start rounded-lg border px-3 py-2 text-sm font-medium"
        >
          Flight date:{" "}
          {dateSortDirection === "asc" ? "Oldest first" : "Newest first"}
        </button>

        {missions.map((mission) => (
          <article key={mission.id} className="rounded-xl border p-4">
            <header className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{mission.code}</p>
                <p>{mission.name}</p>
              </div>
              <MissionStatusBadge status={mission.status} />
            </header>

            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="text-zinc-500">Drone</dt>
                <dd>{mission.droneName}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Flight date</dt>
                <dd>{new Date(mission.startTime).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Duration</dt>
                <dd>{getDurationInMinutes(mission)} min</dd>
              </div>
            </dl>

            <Link
              href={`/missions/${mission.id}`}
              className="mt-4 inline-block font-medium text-blue-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label={`View details for ${mission.name}`}
            >
              View details
            </Link>
          </article>
        ))}
      </div>

      <div className="hidden max-h-[32rem] overflow-auto rounded-xl border border-zinc-200 md:block dark:border-zinc-800">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-zinc-100 dark:bg-zinc-900">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Mission
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Drone
              </th>
              <th
                scope="col"
                aria-sort={
                  dateSortDirection === "asc" ? "ascending" : "descending"
                }
                className="px-4 py-3 font-semibold"
              >
                <button
                  type="button"
                  onClick={onToggleDateSort}
                  className="inline-flex items-center gap-2 rounded focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Flight date
                  <span aria-hidden="true">
                    {dateSortDirection === "asc" ? "↑" : "↓"}
                  </span>
                </button>
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Duration
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {missions.map((mission) => (
              <tr key={mission.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{mission.code}</p>
                  <p>{mission.name}</p>
                </td>
                <td className="px-4 py-3">{mission.droneName}</td>
                <td className="px-4 py-3">
                  {new Date(mission.startTime).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {getDurationInMinutes(mission)} min
                </td>
                <td className="px-4 py-3">
                  <MissionStatusBadge status={mission.status} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/missions/${mission.id}`}
                    className="font-medium text-blue-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                    aria-label={`View details for ${mission.name}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
