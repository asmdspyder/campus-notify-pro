import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Mail,
  MapPin,
  Phone,
  UserRound,
  Users,
} from "lucide-react";

import { PublicFooter, PublicHeader } from "@/components/events/PublicHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesApi, eventsApi } from "@/lib/api/client";
import { formatDate, formatLongDate, formatTimeRange, getRegistrationState } from "@/lib/event-utils";

export const Route = createFileRoute("/events/$id")({
  head: () => ({
    meta: [
      { title: "Event details — Campus Events" },
      {
        name: "description",
        content: "Full schedule, venue, eligibility and registration details for this campus event.",
      },
      { property: "og:title", content: "Event details — Campus Events" },
      {
        property: "og:description",
        content: "Full schedule, venue, eligibility and registration details for this campus event.",
      },
    ],
  }),
  component: EventDetailsPage,
});

function EventDetailsPage() {
  const { id } = Route.useParams();
  const eventQuery = useQuery({ queryKey: ["event", id], queryFn: () => eventsApi.get(id) });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });

  const event = eventQuery.data;
  const category = categoriesQuery.data?.find((c) => c.id === event?.categoryId);
  const registration = event ? getRegistrationState(event) : null;

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground">
          <Link to="/events">
            <ArrowLeft className="size-4" /> All events
          </Link>
        </Button>

        {eventQuery.isLoading ? (
          <div className="space-y-5">
            <Skeleton className="aspect-[16/7] w-full rounded-lg" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : eventQuery.isError || !event ? (
          <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-20 text-center">
            <h1 className="text-lg font-semibold">Event not found</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              This event may have been removed or is no longer published.
            </p>
            <Button asChild className="mt-5">
              <Link to="/events">Browse events</Link>
            </Button>
          </div>
        ) : (
          <article>
            <div className="aspect-[16/7] w-full overflow-hidden rounded-lg border border-border bg-muted">
              {event.poster ? (
                <img
                  src={event.poster}
                  alt={`${event.name} poster`}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                  No poster available
                </div>
              )}
            </div>

            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
              <div>
                {category ? (
                  <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                    {category.name}
                  </span>
                ) : null}
                <h1 className="mt-2 text-2xl font-semibold sm:text-4xl">{event.name}</h1>
                <p className="mt-3 text-sm text-muted-foreground">Organized by {event.organizer}</p>

                <div className="mt-8 space-y-4 text-[0.95rem] leading-relaxed">
                  {event.fullDescription.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {event.eligibility ? (
                  <div className="mt-8">
                    <h2 className="text-sm font-semibold">Eligibility</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">{event.eligibility}</p>
                  </div>
                ) : null}

                {event.instructions ? (
                  <div className="mt-6">
                    <h2 className="text-sm font-semibold">Instructions</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">{event.instructions}</p>
                  </div>
                ) : null}

                {event.contactPerson || event.contactEmail || event.contactPhone ? (
                  <div className="mt-8">
                    <h2 className="text-sm font-semibold">Contact</h2>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      {event.contactPerson ? (
                        <li className="flex items-center gap-2">
                          <UserRound className="size-4" /> {event.contactPerson}
                        </li>
                      ) : null}
                      {event.contactEmail ? (
                        <li className="flex items-center gap-2">
                          <Mail className="size-4" />
                          <a className="hover:underline" href={`mailto:${event.contactEmail}`}>
                            {event.contactEmail}
                          </a>
                        </li>
                      ) : null}
                      {event.contactPhone ? (
                        <li className="flex items-center gap-2">
                          <Phone className="size-4" /> {event.contactPhone}
                        </li>
                      ) : null}
                    </ul>
                  </div>
                ) : null}
              </div>

              <aside className="h-fit rounded-lg border border-border bg-surface p-5 lg:sticky lg:top-24">
                <dl className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <dt className="font-medium">{formatLongDate(event.date)}</dt>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <dd>{formatTimeRange(event)}</dd>
                  </div>
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <dt className="font-medium">{event.venueName}</dt>
                      {event.venueDetails ? (
                        <dd className="text-muted-foreground">{event.venueDetails}</dd>
                      ) : null}
                    </div>
                  </div>
                  {event.maxParticipants ? (
                    <div className="flex gap-3">
                      <Users className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <dd>{event.maxParticipants} seats</dd>
                    </div>
                  ) : null}
                </dl>

                <div className="mt-6 border-t border-border pt-5">
                  {registration?.kind === "open" ? (
                    <>
                      <Button
                        className="w-full"
                        onClick={() =>
                          window.open(event.formUrl, "_blank", "noopener,noreferrer")
                        }
                        disabled={!event.formUrl}
                      >
                        Register Now
                      </Button>
                      {event.registrationEnd ? (
                        <p className="mt-2 text-center text-xs text-muted-foreground">
                          Closes {formatDate(event.registrationEnd)}
                        </p>
                      ) : null}
                    </>
                  ) : registration?.kind === "upcoming" ? (
                    <>
                      <Button className="w-full" disabled>
                        Registration Opens Soon
                      </Button>
                      <p className="mt-2 text-center text-xs text-muted-foreground">
                        {registration.label}
                      </p>
                    </>
                  ) : registration?.kind === "closed" ? (
                    <Button className="w-full" variant="outline" disabled>
                      Registration Closed
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      No Registration Required
                    </Button>
                  )}
                </div>
              </aside>
            </div>
          </article>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
