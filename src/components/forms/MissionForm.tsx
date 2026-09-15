"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { drones } from "@/data/drones";
import type { Mission } from "@/types/mission";

interface WaypointDraft {
  id: string;
  latitude: string;
  longitude: string;
}

interface FormValues {
  name: string;
  droneId: string;
  startTime: string;
  endTime: string;
  notes: string;
  waypoints: WaypointDraft[];
}

interface WaypointFieldErrors {
  latitude?: string;
  longitude?: string;
}

interface FormErrors {
  name?: string;
  droneId?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  waypoints?: string;
  waypointFields?: Record<string, WaypointFieldErrors>;
}

interface MissionFormProps {
  initialMission?: Mission;
  cancelHref: string;
}

function createWaypoint(id?: string): WaypointDraft {
  return {
    id: id ?? `wp-${crypto.randomUUID()}`,
    latitude: "",
    longitude: "",
  };
}

function toDateTimeLocal(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function createEmptyValues(): FormValues {
  return {
    name: "",
    droneId: "",
    startTime: "",
    endTime: "",
    notes: "",
    waypoints: [createWaypoint("wp-1"), createWaypoint("wp-2")],
  };
}

function createValuesFromMission(mission: Mission): FormValues {
  return {
    name: mission.name,
    droneId: mission.droneId,
    startTime: toDateTimeLocal(mission.startTime),
    endTime: toDateTimeLocal(mission.endTime),
    notes: mission.notes,
    waypoints: mission.waypoints.map((waypoint) => ({
      id: waypoint.id,
      latitude: waypoint.latitude.toFixed(6).replace(/\.?0+$/, ""),
      longitude: waypoint.longitude.toFixed(6).replace(/\.?0+$/, ""),
    })),
  };
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const name = values.name.trim();

  if (!name) {
    errors.name = "Name is required.";
  } else if (name.length < 3) {
    errors.name = "Name must be at least 3 characters.";
  }

  if (!values.droneId) {
    errors.droneId = "Select a drone.";
  }

  if (!values.startTime) {
    errors.startTime = "Start time is required.";
  }

  if (!values.endTime) {
    errors.endTime = "End time is required.";
  }

  if (values.startTime && values.endTime) {
    const startsAt = new Date(values.startTime).getTime();
    const endsAt = new Date(values.endTime).getTime();

    if (!(endsAt > startsAt)) {
      errors.endTime = "End time must be after start time.";
    }
  }

  if (values.notes.length > 500) {
    errors.notes = "Notes cannot exceed 500 characters.";
  }

  if (values.waypoints.length < 2) {
    errors.waypoints = "Add at least 2 waypoints.";
  }

  const waypointFields: Record<string, WaypointFieldErrors> = {};

  for (const waypoint of values.waypoints) {
    const fieldErrors: WaypointFieldErrors = {};
    const latitude = Number(waypoint.latitude);
    const longitude = Number(waypoint.longitude);

    if (
      waypoint.latitude.trim() === "" ||
      Number.isNaN(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      fieldErrors.latitude = "Latitude must be between -90 and 90.";
    }

    if (
      waypoint.longitude.trim() === "" ||
      Number.isNaN(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      fieldErrors.longitude = "Longitude must be between -180 and 180.";
    }

    if (fieldErrors.latitude || fieldErrors.longitude) {
      waypointFields[waypoint.id] = fieldErrors;
    }
  }

  if (Object.keys(waypointFields).length > 0) {
    errors.waypointFields = waypointFields;
  }

  return errors;
}

function hasErrors(errors: FormErrors): boolean {
  return Boolean(
    errors.name ||
      errors.droneId ||
      errors.startTime ||
      errors.endTime ||
      errors.notes ||
      errors.waypoints ||
      errors.waypointFields,
  );
}

export function MissionForm({ initialMission, cancelHref }: MissionFormProps) {
  const router = useRouter();
  const [initialValues, setInitialValues] = useState(() =>
    initialMission ? createValuesFromMission(initialMission) : createEmptyValues(),
  );
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialValues),
    [initialValues, values],
  );

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  function updateValues(nextValues: FormValues) {
    setValues(nextValues);
    setSuccessMessage(null);
  }

  function handleCancel() {
    if (isDirty && !window.confirm("You have unsaved changes. Discard them?")) {
      return;
    }

    router.push(cancelHref);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);

    window.setTimeout(() => {
      setIsSubmitting(false);
      setInitialValues(values);
      setSuccessMessage("Mission saved.");
    }, 700);
  }

  return (
    <form className="flex min-w-0 flex-col gap-5" onSubmit={handleSubmit} noValidate>
      {successMessage ? (
        <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          {successMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-1">
        <label htmlFor="mission-name" className="font-medium">
          Name
        </label>
        <input
          id="mission-name"
          type="text"
          value={values.name}
          onChange={(event) => {
            updateValues({ ...values, name: event.target.value });
          }}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "mission-name-error" : undefined}
        />
        {errors.name ? (
          <p id="mission-name-error" className="text-sm text-red-600">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="mission-drone" className="font-medium">
          Drone
        </label>
        <select
          id="mission-drone"
          value={values.droneId}
          onChange={(event) => {
            updateValues({ ...values, droneId: event.target.value });
          }}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          aria-invalid={Boolean(errors.droneId)}
          aria-describedby={errors.droneId ? "mission-drone-error" : undefined}
        >
          <option value="">Select a drone</option>
          {drones.map((drone) => (
            <option key={drone.id} value={drone.id}>
              {drone.name}
            </option>
          ))}
        </select>
        {errors.droneId ? (
          <p id="mission-drone-error" className="text-sm text-red-600">
            {errors.droneId}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="mission-start" className="font-medium">
            Start time
          </label>
          <input
            id="mission-start"
            type="datetime-local"
            value={values.startTime}
            onChange={(event) => {
              updateValues({ ...values, startTime: event.target.value });
            }}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            aria-invalid={Boolean(errors.startTime)}
            aria-describedby={
              errors.startTime ? "mission-start-error" : undefined
            }
          />
          {errors.startTime ? (
            <p id="mission-start-error" className="text-sm text-red-600">
              {errors.startTime}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="mission-end" className="font-medium">
            End time
          </label>
          <input
            id="mission-end"
            type="datetime-local"
            value={values.endTime}
            onChange={(event) => {
              updateValues({ ...values, endTime: event.target.value });
            }}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            aria-invalid={Boolean(errors.endTime)}
            aria-describedby={errors.endTime ? "mission-end-error" : undefined}
          />
          {errors.endTime ? (
            <p id="mission-end-error" className="text-sm text-red-600">
              {errors.endTime}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="mission-notes" className="font-medium">
          Notes
        </label>
        <textarea
          id="mission-notes"
          value={values.notes}
          onChange={(event) => {
            updateValues({ ...values, notes: event.target.value });
          }}
          rows={4}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          aria-invalid={Boolean(errors.notes)}
          aria-describedby="mission-notes-count"
        />
        <p id="mission-notes-count" className="text-sm text-zinc-500">
          {values.notes.length} / 500
        </p>
        {errors.notes ? (
          <p className="text-sm text-red-600">{errors.notes}</p>
        ) : null}
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-medium">Waypoints</legend>
        {errors.waypoints ? (
          <p className="text-sm text-red-600">{errors.waypoints}</p>
        ) : null}

        {values.waypoints.map((waypoint, index) => {
          const fieldErrors = errors.waypointFields?.[waypoint.id];

          return (
            <div
              key={waypoint.id}
              className="grid gap-3 rounded-xl border border-zinc-200 p-3 sm:grid-cols-[1fr_1fr_auto] dark:border-zinc-800"
            >
              <div className="flex flex-col gap-1">
                <label
                  htmlFor={`${waypoint.id}-lat`}
                  className="text-sm text-zinc-500"
                >
                  Point {index + 1} latitude
                </label>
                <input
                  id={`${waypoint.id}-lat`}
                  type="text"
                  inputMode="decimal"
                  value={waypoint.latitude}
                  onChange={(event) => {
                    updateValues({
                      ...values,
                      waypoints: values.waypoints.map((item) =>
                        item.id === waypoint.id
                          ? { ...item, latitude: event.target.value }
                          : item,
                      ),
                    });
                  }}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                  aria-invalid={Boolean(fieldErrors?.latitude)}
                />
                {fieldErrors?.latitude ? (
                  <p className="text-sm text-red-600">{fieldErrors.latitude}</p>
                ) : null}
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor={`${waypoint.id}-lng`}
                  className="text-sm text-zinc-500"
                >
                  Point {index + 1} longitude
                </label>
                <input
                  id={`${waypoint.id}-lng`}
                  type="text"
                  inputMode="decimal"
                  value={waypoint.longitude}
                  onChange={(event) => {
                    updateValues({
                      ...values,
                      waypoints: values.waypoints.map((item) =>
                        item.id === waypoint.id
                          ? { ...item, longitude: event.target.value }
                          : item,
                      ),
                    });
                  }}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                  aria-invalid={Boolean(fieldErrors?.longitude)}
                />
                {fieldErrors?.longitude ? (
                  <p className="text-sm text-red-600">
                    {fieldErrors.longitude}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (values.waypoints.length <= 2) {
                    setErrors({
                      ...errors,
                      waypoints: "Add at least 2 waypoints.",
                    });
                    return;
                  }

                  updateValues({
                    ...values,
                    waypoints: values.waypoints.filter(
                      (item) => item.id !== waypoint.id,
                    ),
                  });
                }}
                className="h-fit self-end rounded-lg border px-3 py-2 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => {
            updateValues({
              ...values,
              waypoints: [...values.waypoints, createWaypoint()],
            });
          }}
          className="w-fit rounded-lg border px-3 py-2 text-sm font-medium"
        >
          Add waypoint
        </button>
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
        >
          {isSubmitting ? "Saving..." : isDirty ? "Unsaved changes" : "Save"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-lg border px-4 py-2 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
