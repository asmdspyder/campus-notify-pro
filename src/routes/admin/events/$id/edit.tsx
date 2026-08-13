import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { EventForm } from "@/components/admin/EventForm";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesApi, eventsApi } from "@/lib/api/client";
import type { EventInput } from "@/types";

export const Route = createFileRoute("/admin/events/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Event — Campus Events Admin" },
      { name: "description", content: "Update schedule, venue, registration and content for this event." },
      { property: "og:title", content: "Edit Event — Campus Events Admin" },
      { property: "og:description", content: "Update details for an existing campus event." },
    ],
  }),
  component: EditEventPage,
});

function EditEventPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });
  const eventQuery = useQuery({ queryKey: ["event", id], queryFn: () => eventsApi.get(id) });

  const updateMutation = useMutation({
    mutationFn: (values: EventInput) => eventsApi.update(id, values),
    onSuccess: (event) => {
      toast.success(event.status === "published" ? "Event published" : "Changes saved");
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["event", id] });
      qc.invalidateQueries({ queryKey: ["public-events"] });
      navigate({ to: "/admin/events" });
    },
    onError: () => toast.error("Could not save the event"),
  });

  return (
    <AdminLayout title="Edit event" description={eventQuery.data?.name}>
      {eventQuery.isLoading || categoriesQuery.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : eventQuery.isError || !eventQuery.data ? (
        <p className="text-sm text-destructive">This event could not be found.</p>
      ) : (
        <EventForm
          categories={categoriesQuery.data ?? []}
          initialEvent={eventQuery.data}
          submitting={updateMutation.isPending}
          onSubmit={(values) => updateMutation.mutate(values)}
          onCancel={() => navigate({ to: "/admin/events" })}
        />
      )}
    </AdminLayout>
  );
}
