import { cn } from "@/lib/utils";
import type { EventStatus, RegistrationState } from "@/types";

const base =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const styles: Record<EventStatus, string> = {
    published: "border-transparent bg-success-soft text-success",
    draft: "border-border bg-muted text-muted-foreground",
    disabled: "border-transparent bg-warning-soft text-warning",
  };
  const label = { published: "Published", draft: "Draft", disabled: "Disabled" }[status];
  return <span className={cn(base, styles[status])}>{label}</span>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        base,
        active
          ? "border-transparent bg-success-soft text-success"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      {active ? "Active" : "Disabled"}
    </span>
  );
}

export function RegistrationBadge({ state }: { state: RegistrationState }) {
  const styles: Record<RegistrationState["kind"], string> = {
    open: "border-transparent bg-success-soft text-success",
    upcoming: "border-transparent bg-warning-soft text-warning",
    closed: "border-border bg-muted text-muted-foreground",
    "not-required": "border-border bg-muted text-muted-foreground",
  };
  return <span className={cn(base, styles[state.kind])}>{state.label}</span>;
}