"use client";

import { useMemo } from "react";
import { formatDayHeading } from "@/lib/utils";

interface DateTimeFieldsProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  location: string;
  onLocationChange: (location: string) => void;
  showLocation?: boolean;
  className?: string;
}

/** Combine date (YYYY-MM-DD) + time (HH:mm) to ISO string in local intent (stored as UTC from components). */
export function combineDateTime(date: string, time: string): string {
  if (!date) return new Date().toISOString();
  const t = time || "12:00";
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = t.split(":").map(Number);
  const local = new Date(y, m - 1, d, hh, mm, 0, 0);
  return local.toISOString();
}

export function splitDateTime(iso: string): { date: string; time: string } {
  const dt = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`,
    time: `${pad(dt.getHours())}:${pad(dt.getMinutes())}`,
  };
}

export function DateTimeFields({
  date,
  time,
  onDateChange,
  onTimeChange,
  location,
  onLocationChange,
  showLocation = true,
  className,
}: DateTimeFieldsProps) {
  const heading = useMemo(() => {
    if (!date) return "";
    try {
      return formatDayHeading(`${date}T12:00:00`);
    } catch {
      return date;
    }
  }, [date]);

  return (
    <div className={className}>
      {heading && <p className="datetime-fields__heading">{heading}</p>}
      <div className="datetime-fields__row">
        <label className="datetime-fields__label">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="datetime-fields__input"
          />
        </label>
        <label className="datetime-fields__label">
          Time
          <input
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            className="datetime-fields__input"
          />
        </label>
      </div>
      {showLocation && (
        <label className="datetime-fields__label datetime-fields__label--full">
          Location
          <input
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="e.g. Huadu, Guangzhou"
            className="datetime-fields__input"
          />
        </label>
      )}
    </div>
  );
}
