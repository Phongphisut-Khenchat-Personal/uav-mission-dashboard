import type {
  Mission,
  MissionStatus,
  TelemetryPoint,
  Waypoint,
} from "@/types/mission";
import { drones } from "@/data/drones";

const statuses: MissionStatus[] = [
  "planned",
  "in-progress",
  "completed",
  "failed",
];

const missionNames: string[] = [
  "Northern Field Survey",
  "Riverbank Inspection",
  "Solar Farm Mapping",
  "Forest Health Scan",
  "Pipeline Patrol",
  "Coastal Monitoring",
  "Emergency Supply Run",
  "Construction Progress Survey",
];

const statusNotes: Record<MissionStatus, string> = {
  planned: "Scheduled and waiting for a clear weather window.",
  "in-progress": "Airborne and tracking toward the next waypoint.",
  completed: "All waypoints completed. Data package uploaded.",
  failed: "Link lost mid-route. Aircraft returned to home.",
};

function pad(value: number): string {
  return String(value).padStart(3, "0");
}

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

function createWaypoints(index: number): Waypoint[] {
  const latitude = 13.7563 + (index % 8) * 0.04;
  const longitude = 100.5018 + (index % 5) * 0.05;

  return [
    { id: `wp-${pad(index + 1)}-1`, latitude, longitude },
    {
      id: `wp-${pad(index + 1)}-2`,
      latitude: latitude + 0.018,
      longitude: longitude + 0.012,
    },
    {
      id: `wp-${pad(index + 1)}-3`,
      latitude: latitude + 0.009,
      longitude: longitude + 0.028,
    },
  ];
}

function createTelemetryHistory(
  startTime: Date,
  endTime: Date,
  waypoints: Waypoint[],
  status: MissionStatus,
): TelemetryPoint[] {
  const durationMs = endTime.getTime() - startTime.getTime();
  const endBattery =
    status === "failed" ? 44 : status === "in-progress" ? 72 : status === "planned" ? 96 : 29;

  return Array.from({ length: 10 }, (_, pointIndex) => {
    const t = pointIndex / 9;
    const segment = t < 0.5 ? 0 : 1;
    const localT = t < 0.5 ? t * 2 : (t - 0.5) * 2;
    const from = waypoints[segment];
    const to = waypoints[segment + 1];

    return {
      timestamp: new Date(startTime.getTime() + durationMs * t).toISOString(),
      battery: Math.round(lerp(98, endBattery, t)),
      altitude: Math.round(lerp(18, 118, Math.sin(t * Math.PI))),
      speed: Number(lerp(3.2, 14.6, Math.sin(t * Math.PI)).toFixed(1)),
      latitude: lerp(from.latitude, to.latitude, localT),
      longitude: lerp(from.longitude, to.longitude, localT),
    };
  });
}

function createMockMission(index: number): Mission {
  const drone = drones[index % drones.length];
  const status = statuses[index % statuses.length];
  const missionName = missionNames[index % missionNames.length];

  const startTime = new Date(Date.UTC(2026, 8, 1, 6, 0, 0));
  startTime.setUTCHours(startTime.getUTCHours() + index * 3);
  const endTime = new Date(startTime.getTime() + 75 * 60 * 1000);
  const waypoints = createWaypoints(index);
  const telemetryHistory = createTelemetryHistory(
    startTime,
    endTime,
    waypoints,
    status,
  );

  return {
    id: `mission-${pad(index + 1)}`,
    code: `MSN-${pad(index + 1)}`,
    name: missionName,
    droneId: drone.id,
    droneName: drone.name,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    status,
    notes: statusNotes[status],
    waypoints,
    telemetryHistory,
  };
}

export const missions: Mission[] = Array.from(
  { length: 40 },
  (_, index) => createMockMission(index),
);
