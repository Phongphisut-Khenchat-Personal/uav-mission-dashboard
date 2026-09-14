export type MissionStatus =
  | "planned"
  | "in-progress"
  | "completed"
  | "failed";

export interface Waypoint {
  id: string;
  latitude: number;
  longitude: number;
}

export interface TelemetryPoint {
  timestamp: string;
  battery: number;
  altitude: number;
  speed: number;
  latitude: number;
  longitude: number;
}

export interface Mission {
  id: string;
  code: string;
  name: string;
  droneId: string;
  droneName: string;
  startTime: string;
  endTime: string;
  status: MissionStatus;
  notes: string;
  waypoints: Waypoint[];
  telemetryHistory: TelemetryPoint[];
}