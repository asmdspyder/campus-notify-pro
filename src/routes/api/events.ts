import { createFileRoute } from "@tanstack/react-router";
import { store } from "@/lib/store";
import type { EventInput } from "@/types";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

export const Route = createFileRoute("/api/events")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const id = params.get("id");
        if (id) {
          const event = store.getEvent(id);
          return event ? json(event) : json({ error: "Not found" }, 404);
        }
        const status = params.get("status");
        const events = store.listEvents();
        return json(status ? events.filter((e) => e.status === status) : events);
      },
      POST: async ({ request }) => {
        const body = (await request.json()) as EventInput;
        if (!body?.name) return json({ error: "Name is required" }, 400);
        return json(store.createEvent(body), 201);
      },
      PUT: async ({ request }) => {
        const body = (await request.json()) as { id: string } & Partial<EventInput>;
        const updated = store.updateEvent(body.id, body);
        return updated ? json(updated) : json({ error: "Not found" }, 404);
      },
      PATCH: async ({ request }) => {
        const body = (await request.json()) as { id: string } & Partial<EventInput>;
        const updated = store.updateEvent(body.id, body);
        return updated ? json(updated) : json({ error: "Not found" }, 404);
      },
    },
  },
});