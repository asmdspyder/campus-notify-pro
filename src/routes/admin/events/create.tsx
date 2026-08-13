import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { EventForm } from "@/components/admin/EventForm";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesApi, eventsApi } from "@/lib/api/client";
import type { EventInput } from "@/types";

export const Route = createFileRoute("/admin/events/create")({
  head: () => ({
    meta: [
      { title: "Create Event — Campus Events Admin" },
      { name: "description", content: "Add a new campus event with schedule, venue and registration." },
      { property: "og:title", content: "Create Event — Campus Events Admin" },
      { property: "og:description", content: "Add a new campus event with schedule and registration." },
    ],
  }),
  component: CreateEventPage,
});

function CreateEventPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });

  const createMutation = useMutation({
    mutationFn: (values: EventInput) => eventsApi.create(values),
    onSuccess: (event) => {
      toast.success(event.status === "published" ? "Event published" : "Draft saved");
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["public-events"] });
      navigate({ to: "/admin/events" });
    },
    onError: () => toast.error("Could not save the event"),
  });

  return (
    <AdminLayout title="Create event" description="Fill in the sections below, then publish.">
      {categoriesQuery.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <EventForm
          categories={categoriesQuery.data ?? []}
          submitting={createMutation.isPending}
          onSubmit={(values) => createMutation.mutate(values)}
          onCancel={() => navigate({ to: "/admin/events" })}
        />
      )}
    </AdminLayout>
  );
}
