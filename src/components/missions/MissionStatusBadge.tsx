import type { MissionStatus } from "@/types/mission";

interface MissionStatusBadgeProps {
  status: MissionStatus;
}

const statusLabels: Record<MissionStatus, string> = {
  planned: "Planned",
  "in-progress": "In progress",
  completed: "Completed",
  failed: "Failed",
};

const statusStyles: Record<MissionStatus, string> = {
  planned: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  "in-progress": "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function MissionStatusBadge({ status }: MissionStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
