import type { TelemetryPoint } from "@/types/mission";

interface MissionChartProps {
  telemetryHistory: TelemetryPoint[];
}

export function MissionChart({ telemetryHistory }: MissionChartProps) {
  if (telemetryHistory.length === 0) {
    return <p>No telemetry is available for this mission.</p>;
  }

  const width = 640;
  const height = 220;
  const padding = { top: 16, right: 16, bottom: 28, left: 40 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const lastIndex = Math.max(telemetryHistory.length - 1, 1);

  const points = telemetryHistory
    .map((point, index) => {
      const x = padding.left + (index / lastIndex) * plotWidth;
      const y = padding.top + ((100 - point.battery) / 100) * plotHeight;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      role="img"
      aria-label="Battery level over mission time"
      viewBox={`0 0 ${width} ${height}`}
      className="w-full max-w-2xl text-sky-500"
    >
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={height - padding.bottom}
        stroke="currentColor"
        className="text-zinc-400"
      />
      <line
        x1={padding.left}
        y1={height - padding.bottom}
        x2={width - padding.right}
        y2={height - padding.bottom}
        stroke="currentColor"
        className="text-zinc-400"
      />
      <text
        x={padding.left - 8}
        y={padding.top + 4}
        textAnchor="end"
        className="fill-zinc-500 text-[10px]"
      >
        100
      </text>
      <text
        x={padding.left - 8}
        y={height - padding.bottom}
        textAnchor="end"
        className="fill-zinc-500 text-[10px]"
      >
        0
      </text>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}
