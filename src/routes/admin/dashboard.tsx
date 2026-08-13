import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Layers, Plus, Tags, Timer } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { EventStatusBadge, RegistrationBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesApi, eventsApi } from "@/lib/api/client";
import { formatDate, getRegistrationState, isUpcoming } from "@/lib/event-utils";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Campus Events Admin" },
      { name: "description", content: "Overview of campus event categories, listings and upcoming schedule." },
      { property: "og:title", content: "Dashboard — Campus Events Admin" },
      { property: "og:description", content: "Overview of categories, events and upcoming schedule." },
    ],
  }),
  component: DashboardPage,
});

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  icon: typeof Layers;
  loading: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-12" />
      ) : (
        <p className="mt-2 text-3xl font-semibold">{value}</p>
      )}
    </div>
  );
}

function DashboardPage() {
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });
  const eventsQuery = useQuery({ queryKey: ["events"], queryFn: eventsApi.list });

  const categories = categoriesQuery.data ?? [];
  const events = eventsQuery.data ?? [];
  const loading = categoriesQuery.isLoading || eventsQuery.isLoading;
  const upcoming = events.filter((e) => isUpcoming(e) && e.status !== "disabled");

  return (
    <AdminLayout
      title="Dashboard"
      description="Everything happening across campus at a glance."
      actions={
        <>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/categories">
              <Plus className="size-4" /> Create Category
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/admin/events/create">
              <Plus className="size-4" /> Create Event
            </Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total categories" value={categories.length} icon={Tags} loading={loading} />
        <StatCard
          label="Active categories"
          value={categories.filter((c) => c.active).length}
          icon={Layers}
          loading={loading}
        />
        <StatCard label="Total events" value={events.length} icon={CalendarDays} loading={loading} />
        <StatCard
          label="Published events"
          value={events.filter((e) => e.status === "published").length}
          icon={CheckCircle2}
          loading={loading}
        />
        <StatCard label="Upcoming events" value={upcoming.length} icon={Timer} loading={loading} />
      </div>

      <section className="mt-8 rounded-lg border border-border bg-background shadow-soft">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Upcoming events</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/events">View all</Link>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm font-medium">No upcoming events</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create an event to see it listed here.
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link to="/admin/events/create">Create Event</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-surface text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Event</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Venue</th>
                    <th className="px-5 py-3 font-medium">Registration</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((event) => (
                    <tr key={event.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 font-medium">{event.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {categories.find((c) => c.id === event.categoryId)?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{formatDate(event.date)}</td>
                      <td className="px-5 py-3 text-muted-foreground">{event.venueName}</td>
                      <td className="px-5 py-3">
                        <RegistrationBadge state={getRegistrationState(event)} />
                      </td>
                      <td className="px-5 py-3">
                        <EventStatusBadge status={event.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link to="/admin/events/$id/edit" params={{ id: event.id }}>
                            Edit
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-border md:hidden">
              {upcoming.map((event) => (
                <li key={event.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{event.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {categories.find((c) => c.id === event.categoryId)?.name} ·{" "}
                        {formatDate(event.date)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{event.venueName}</p>
                    </div>
                    <EventStatusBadge status={event.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <RegistrationBadge state={getRegistrationState(event)} />
                    <Button asChild variant="outline" size="sm">
                      <Link to="/admin/events/$id/edit" params={{ id: event.id }}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </AdminLayout>
  );
}
