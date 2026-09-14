"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MissionTable } from "@/components/missions/MissionTable";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { Mission, MissionStatus } from "@/types/mission";

interface MissionsResponse {
  data: Mission[];
  total: number;
}

const missionStatuses: MissionStatus[] = [
  "planned",
  "in-progress",
  "completed",
  "failed",
];

function isMissionStatus(value: string): value is MissionStatus {
  return missionStatuses.includes(value as MissionStatus);
}

export function MissionList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") ?? "";

  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(queryFromUrl);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  const selectedStatuses = useMemo(() => {
    const rawStatus = searchParams.get("status");

    if (!rawStatus) {
      return [];
    }

    return rawStatus.split(",").filter(isMissionStatus);
  }, [searchParams]);

  useEffect(() => {
    async function loadMissions() {
      try {
        const response = await fetch("/api/missions");

        if (!response.ok) {
          const payload = (await response.json()) as { message?: string };
          throw new Error(payload.message ?? "Unable to load missions");
        }

        const payload = (await response.json()) as MissionsResponse;
        setMissions(payload.data);
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Unable to load missions",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadMissions();
  }, []);

  useEffect(() => {
    const nextQuery = debouncedSearch.trim() ? debouncedSearch : "";
    const currentQuery = searchParams.get("q") ?? "";

    if (nextQuery === currentQuery) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (nextQuery) {
      params.set("q", nextQuery);
    } else {
      params.delete("q");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [debouncedSearch, pathname, router, searchParams]);

  function toggleStatus(status: MissionStatus) {
    const params = new URLSearchParams(searchParams.toString());
    const nextStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((value) => value !== status)
      : [...selectedStatuses, status];

    if (nextStatuses.length > 0) {
      params.set("status", nextStatuses.join(","));
    } else {
      params.delete("status");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  const filteredMissions = useMemo(() => {
    const normalizedQuery = debouncedSearch.trim().toLowerCase();

    return missions.filter((mission) => {
      const matchesSearch =
        !normalizedQuery ||
        mission.name.toLowerCase().includes(normalizedQuery) ||
        mission.droneName.toLowerCase().includes(normalizedQuery);

      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(mission.status);

      return matchesSearch && matchesStatus;
    });
  }, [missions, debouncedSearch, selectedStatuses]);

  if (isLoading) {
    return <p>Loading missions...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (missions.length === 0) {
    return <p>No missions available.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="mission-search" className="font-medium">
          Search missions
        </label>
        <input
          id="mission-search"
          type="search"
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
          }}
          placeholder="Search by mission or drone name"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          autoComplete="off"
        />
      </div>

      <fieldset>
        <legend className="font-medium">Status</legend>

        <div className="mt-2 flex flex-wrap gap-3">
          {missionStatuses.map((status) => (
            <label key={status} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedStatuses.includes(status)}
                onChange={() => {
                  toggleStatus(status);
                }}
              />
              <span>{status}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {filteredMissions.length === 0 ? (
        <p>No missions match your search.</p>
      ) : (
        <MissionTable missions={filteredMissions} />
      )}
    </div>
  );
}
