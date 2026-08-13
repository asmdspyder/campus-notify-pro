import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ActiveBadge, EventStatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesApi, eventsApi } from "@/lib/api/client";
import { formatDate } from "@/lib/event-utils";

export const Route = createFileRoute("/admin/categories/$id")({
  head: () => ({
    meta: [
      { title: "Category details — Campus Events Admin" },
      { name: "description", content: "Events grouped under this campus event category." },
      { property: "og:title", content: "Category details — Campus Events Admin" },
      { property: "og:description", content: "Events grouped under this campus event category." },
    ],
  }),
  component: CategoryDetailPage,
});

function CategoryDetailPage() {
  const { id } = Route.useParams();
  const categoryQuery = useQuery({ queryKey: ["category", id], queryFn: () => categoriesApi.get(id) });
  const eventsQuery = useQuery({ queryKey: ["events"], queryFn: eventsApi.list });
  const events = (eventsQuery.data ?? []).filter((e) => e.categoryId === id);

  return (
    <AdminLayout
      title={categoryQuery.data?.name ?? "Category"}
      description={categoryQuery.data?.description}
      actions={
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/categories">
            <ArrowLeft className="size-4" /> Back
          </Link>
        </Button>
      }
    >
      {categoryQuery.isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : categoryQuery.isError ? (
        <p className="text-sm text-destructive">This category could not be found.</p>
      ) : (
        <div className="rounded-lg border border-border bg-background p-5 shadow-soft">
          <ActiveBadge active={Boolean(categoryQuery.data?.active)} />
          <p className="mt-3 text-sm text-muted-foreground">
            {events.length} event{events.length === 1 ? "" : "s"} in this category.
          </p>
        </div>
      )}

      <div className="mt-6 rounded-lg border border-border bg-background shadow-soft">
        {eventsQuery.isLoading ? (
          <div className="space-y-3 p-5">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm font-medium">No events in this category</p>
            <Button asChild size="sm" className="mt-4">
              <Link to="/admin/events/create">Create Event</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {events.map((event) => (
              <li key={event.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="font-medium">{event.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(event.date)} · {event.venueName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <EventStatusBadge status={event.status} />
                  <Button asChild variant="outline" size="sm">
                    <Link to="/admin/events/$id/edit" params={{ id: event.id }}>
                      Edit
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
}
