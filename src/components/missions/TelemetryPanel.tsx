"use client";

import { useEffect, useState } from "react";
import type { TelemetryPoint } from "@/types/mission";

interface TelemetryPanelProps {
  initialTelemetry: TelemetryPoint;
}

function nextTelemetry(current: TelemetryPoint, tick: number): TelemetryPoint {
  const altitudeDelta = tick % 2 === 0 ? 1.4 : -1.1;
  const speedDelta = tick % 2 === 0 ? 0.3 : -0.2;

  return {
    timestamp: new Date().toISOString(),
    battery: Math.max(0, current.battery - 1),
    altitude: Math.max(0, Number((current.altitude + altitudeDelta).toFixed(1))),
    speed: Math.max(0, Number((current.speed + speedDelta).toFixed(1))),
    latitude: current.latitude + 0.00008,
    longitude: current.longitude + 0.00005,
  };
}

export function TelemetryPanel({ initialTelemetry }: TelemetryPanelProps) {
  const [telemetry, setTelemetry] = useState(initialTelemetry);
  const isLowBattery = telemetry.battery < 20;

  useEffect(() => {
    let tick = 0;
    const intervalId = setInterval(() => {
      tick += 1;
      setTelemetry((current) => nextTelemetry(current, tick));
    }, 1500);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <section
      className={`rounded-xl border p-4 ${
        isLowBattery
          ? "border-red-300 bg-red-100 dark:border-red-800 dark:bg-red-950"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <h2 className="text-lg font-semibold">Live telemetry</h2>
      {isLowBattery ? (
        <p className="mt-2 text-sm font-medium text-red-700 dark:text-red-300">
          Low battery warning
        </p>
      ) : null}
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500">Battery</dt>
          <dd>{telemetry.battery}%</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Altitude</dt>
          <dd>{telemetry.altitude} m</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Speed</dt>
          <dd>{telemetry.speed} m/s</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Current coordinate</dt>
          <dd>
            {telemetry.latitude.toFixed(6)}, {telemetry.longitude.toFixed(6)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
