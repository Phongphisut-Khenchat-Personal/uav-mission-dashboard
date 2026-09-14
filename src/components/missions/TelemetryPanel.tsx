import type { TelemetryPoint } from "@/types/mission";

interface TelemetryPanelProps {
  telemetryHistory: TelemetryPoint[];
}

export function TelemetryPanel({ telemetryHistory }: TelemetryPanelProps) {
  const latest = telemetryHistory.at(-1);

  if (!latest) {
    return <p>No live telemetry is available yet.</p>;
  }

  return (
    <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-lg font-semibold">Live telemetry</h2>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500">Battery</dt>
          <dd>{latest.battery}%</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Altitude</dt>
          <dd>{latest.altitude} m</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Speed</dt>
          <dd>{latest.speed} m/s</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Position</dt>
          <dd>
            {latest.latitude.toFixed(6)}, {latest.longitude.toFixed(6)}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-zinc-500">Updated</dt>
          <dd>{new Date(latest.timestamp).toLocaleString()}</dd>
        </div>
      </dl>
    </section>
  );
}
