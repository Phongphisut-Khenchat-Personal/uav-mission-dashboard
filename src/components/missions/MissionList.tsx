"use client";

import { useEffect, useState } from "react";
import { MissionTable } from "@/components/missions/MissionTable";
import type { Mission } from "@/types/mission";

interface MissionsResponse {
  data: Mission[];
  total: number;
}

export function MissionList() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) {
    return <p>Loading missions...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (missions.length === 0) {
    return <p>No missions available.</p>;
  }

  return <MissionTable missions={missions} />;
}
