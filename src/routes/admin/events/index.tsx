import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CalendarX2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { EventStatusBadge, RegistrationBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { categoriesApi, eventsApi } from "@/lib/api/client";
import { formatDate, getRegistrationState } from "@/lib/event-utils";
import type { CampusEvent } from "@/types";

export const Route = createFileRoute("/admin/events/")({
  head: () => ({
    meta: [
      { title: "Events — Campus Events Admin" },
      { name: "description", content: "Create, publish, search and disable campus events." },
      { property: "og:title", content: "Events — Campus Events Admin" },
      { property: "og:description", content: "Create, publish, search and disable campus events." },
    ],
  }),
  component: EventsAdminPage,
});

function EventsAdminPage() {
  const qc = useQueryClient();
  const eventsQuery = useQuery({ queryKey: ["events"], queryFn: eventsApi.list });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [toDisable, setToDisable] = useState<CampusEvent | null>(null);

  const statusMutation = useMutation({
    mutationFn: ({ id, status: next }: { id: string; status: CampusEvent["status"] }) =>
      eventsApi.setStatus(id, next),
    onSuccess: (event) => {
      toast.success(`${event.name} is now ${event.status}`);
      setToDisable(null);
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["public-events"] });
    },
    onError: () => toast.error("Could not update the event"),
  });

  const events = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (eventsQuery.data ?? [])
      .filter((e) => status === "all" || e.status === status)
      .filter((e) => category === "all" || e.categoryId === category)
      .filter(
        (e) =>
          !term ||
          e.name.toLowerCase().includes(term) ||
          e.venueName.toLowerCase().includes(term) ||
          e.organizer.toLowerCase().includes(term),
      );
  }, [eventsQuery.data, search, status, category]);

  const categories = categoriesQuery.data ?? [];

  return (
    <AdminLayout
      title="Events"
      description="Everything scheduled, drafted or archived."
      actions={
        <Button asChild size="sm">
          <Link to="/admin/events/create">
            <Plus className="size-4" /> Create Event
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events"
            aria-label="Search events"
            className="bg-background pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full bg-background sm:w-48" aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full bg-background sm:w-40" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-background shadow-soft">
        {eventsQuery.isLoading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : eventsQuery.isError ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm font-medium">Couldn't load events</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => eventsQuery.refetch()}>
              Try again
            </Button>
          </div>
        ) : events.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <CalendarX2 className="mx-auto size-7 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No events match your filters</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearch("");
                setStatus("all");
                setCategory("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {events.map((event) => (
              <li key={event.id} className="flex flex-wrap items-start justify-between gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{event.name}</p>
                    <EventStatusBadge status={event.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {categories.find((c) => c.id === event.categoryId)?.name ?? "—"} ·{" "}
                    {formatDate(event.date)} · {event.venueName}
                  </p>
                  <div className="mt-2">
                    <RegistrationBadge state={getRegistrationState(event)} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/events/$id" params={{ id: event.id }}>
                      View
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/admin/events/$id/edit" params={{ id: event.id }}>
                      Edit
                    </Link>
                  </Button>
                  {event.status === "published" ? (
                    <Button variant="ghost" size="sm" onClick={() => setToDisable(event)}>
                      Disable
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => statusMutation.mutate({ id: event.id, status: "published" })}
                      disabled={statusMutation.isPending}
                    >
                      Publish
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertDialog open={Boolean(toDisable)} onOpenChange={(open) => !open && setToDisable(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable {toDisable?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The event will be removed from the student website immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                toDisable && statusMutation.mutate({ id: toDisable.id, status: "disabled" })
              }
            >
              Disable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
