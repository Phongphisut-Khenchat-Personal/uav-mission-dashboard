"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

const PAGE_SIZE = 8;

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

  const dateSortDirection =
    searchParams.get("sort") === "asc" ? "asc" : "desc";

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

  const replaceParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const nextQuery = debouncedSearch.trim() ? debouncedSearch : "";
    const currentQuery = searchParams.get("q") ?? "";

    if (nextQuery === currentQuery) {
      return;
    }

    replaceParams((params) => {
      if (nextQuery) {
        params.set("q", nextQuery);
      } else {
        params.delete("q");
      }

      params.delete("page");
    });
  }, [debouncedSearch, replaceParams, searchParams]);

  function toggleStatus(status: MissionStatus) {
    replaceParams((params) => {
      const nextStatuses = selectedStatuses.includes(status)
        ? selectedStatuses.filter((value) => value !== status)
        : [...selectedStatuses, status];

      if (nextStatuses.length > 0) {
        params.set("status", nextStatuses.join(","));
      } else {
        params.delete("status");
      }

      params.delete("page");
    });
  }

  function toggleDateSort() {
    replaceParams((params) => {
      params.set("sort", dateSortDirection === "asc" ? "desc" : "asc");
      params.delete("page");
    });
  }

  function setPage(page: number) {
    replaceParams((params) => {
      if (page <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(page));
      }
    });
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

  const sortedMissions = useMemo(() => {
    return [...filteredMissions].sort((a, b) => {
      const difference =
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime();

      return dateSortDirection === "asc" ? difference : -difference;
    });
  }, [filteredMissions, dateSortDirection]);

  const requestedPage = Number(searchParams.get("page") ?? "1");
  const totalPages = Math.ceil(sortedMissions.length / PAGE_SIZE);
  const currentPage =
    !Number.isInteger(requestedPage) || requestedPage < 1
      ? 1
      : totalPages < 1
        ? 1
        : Math.min(requestedPage, totalPages);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedMissions = sortedMissions.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

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
        <>
          <MissionTable
            missions={paginatedMissions}
            dateSortDirection={dateSortDirection}
            onToggleDateSort={toggleDateSort}
          />

          <nav
            aria-label="Mission pagination"
            className="flex items-center gap-3"
          >
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => {
                setPage(currentPage - 1);
              }}
              className="rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50"
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => {
                setPage(currentPage + 1);
              }}
              className="rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </>
      )}
    </div>
  );
}
