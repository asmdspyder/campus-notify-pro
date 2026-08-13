import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin } from "lucide-react";

import { RegistrationBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate, formatTimeRange, getRegistrationState } from "@/lib/event-utils";
import type { CampusEvent, Category } from "@/types";

export function EventCard({ event, category }: { event: CampusEvent; category?: Category | undefined }) {
  const registration = getRegistrationState(event);

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-background shadow-soft transition-shadow hover:shadow-md">
      <Link to="/events/$id" params={{ id: event.id }} className="block">
        <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
          {event.poster ? (
            <img
              src={event.poster}
              alt={`${event.name} poster`}
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
              No poster
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {category ? (
          <span className="text-xs font-semibold tracking-wide text-primary uppercase">
            {category.name}
          </span>
        ) : null}
        <h3 className="mt-1.5 text-base font-semibold">
          <Link to="/events/$id" params={{ id: event.id }} className="hover:underline">
            {event.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{event.shortDescription}</p>

        <dl className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0" />
            <dd>{formatDate(event.date)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 shrink-0" />
            <dd>{formatTimeRange(event)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            <dd className="truncate">{event.venueName}</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
          <RegistrationBadge state={registration} />
          <Button asChild size="sm" variant="outline">
            <Link to="/events/$id" params={{ id: event.id }}>
              View event
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
