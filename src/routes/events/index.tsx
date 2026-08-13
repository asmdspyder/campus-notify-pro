import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CalendarX2, Search } from "lucide-react";

import { EventCard } from "@/components/events/EventCard";
import { PublicFooter, PublicHeader } from "@/components/events/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesApi, eventsApi } from "@/lib/api/client";
import { isUpcoming } from "@/lib/event-utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Campus Events — Northfield College" },
      {
        name: "description",
        content:
          "Browse upcoming workshops, fests, sports meets, seminars and competitions at Northfield College.",
      },
      { property: "og:title", content: "Campus Events — Northfield College" },
      {
        property: "og:description",
        content: "Discover what's happening on campus and register in a couple of taps.",
      },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const eventsQuery = useQuery({ queryKey: ["public-events"], queryFn: eventsApi.listPublished });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });

  const categories = useMemo(
    () => (categoriesQuery.data ?? []).filter((c) => c.active),
    [categoriesQuery.data],
  );

  const events = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (eventsQuery.data ?? [])
      .filter(isUpcoming)
      .filter((e) => activeCategory === "all" || e.categoryId === activeCategory)
      .filter(
        (e) =>
          !term ||
          e.name.toLowerCase().includes(term) ||
          e.shortDescription.toLowerCase().includes(term) ||
          e.venueName.toLowerCase().includes(term) ||
          e.organizer.toLowerCase().includes(term),
      );
  }, [eventsQuery.data, search, activeCategory]);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Northfield College
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold text-balance sm:text-5xl">
            Discover What's Happening on Campus
          </h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Every workshop, fest, tournament and guest lecture in one place. Search, filter and
            register — no account needed.
          </p>

          <div className="relative mt-8 max-w-lg">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events, venues or departments"
              aria-label="Search events"
              className="h-11 bg-background pl-9"
            />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div id="categories" className="flex flex-wrap gap-2 scroll-mt-20">
          <CategoryChip
            label="All events"
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              label={c.name}
              active={activeCategory === c.id}
              onClick={() => setActiveCategory(c.id)}
            />
          ))}
        </div>

        <div className="mt-8">
          {eventsQuery.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-lg border border-border p-4">
                  <Skeleton className="aspect-[16/9] w-full rounded-md" />
                  <Skeleton className="mt-4 h-4 w-24" />
                  <Skeleton className="mt-2 h-5 w-3/4" />
                  <Skeleton className="mt-3 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : eventsQuery.isError ? (
            <EmptyState
              title="We couldn't load events"
              body="Something went wrong while fetching the event list."
              action={
                <Button variant="outline" onClick={() => eventsQuery.refetch()}>
                  Try again
                </Button>
              }
            />
          ) : events.length === 0 ? (
            <EmptyState
              title="No events found"
              body="Try a different search term or category filter."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("all");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  category={categories.find((c) => c.id === event.categoryId)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-20 text-center">
      <CalendarX2 className="size-8 text-muted-foreground" />
      <h2 className="mt-4 text-base font-semibold">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
