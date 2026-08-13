import type { CampusEvent, RegistrationState } from "@/types";

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatLongDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = Number(h);
  if (Number.isNaN(hour)) return time;
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m ?? "00"} ${suffix}`;
}

export function formatTimeRange(event: CampusEvent): string {
  return `${formatTime(event.startTime)} – ${formatTime(event.endTime)}`;
}

export function isUpcoming(event: CampusEvent): boolean {
  return event.date >= todayISO();
}

export function getRegistrationState(event: CampusEvent): RegistrationState {
  if (!event.registrationRequired) {
    return { kind: "not-required", label: "No registration required" };
  }
  const today = todayISO();
  if (event.registrationStart && today < event.registrationStart) {
    return { kind: "upcoming", label: `Opens ${formatDate(event.registrationStart)}` };
  }
  if (event.registrationEnd && today > event.registrationEnd) {
    return { kind: "closed", label: "Registration closed" };
  }
  return { kind: "open", label: "Registration open" };
}