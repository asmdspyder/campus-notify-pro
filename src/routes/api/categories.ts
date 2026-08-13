import { createFileRoute } from "@tanstack/react-router";
import { store } from "@/lib/store";
import type { CategoryInput } from "@/types";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

export const Route = createFileRoute("/api/categories")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const id = new URL(request.url).searchParams.get("id");
        if (id) {
          const category = store.getCategory(id);
          return category ? json(category) : json({ error: "Not found" }, 404);
        }
        return json(store.listCategories());
      },
      POST: async ({ request }) => {
        const body = (await request.json()) as CategoryInput;
        if (!body?.name) return json({ error: "Name is required" }, 400);
        return json(store.createCategory(body), 201);
      },
      PUT: async ({ request }) => {
        const body = (await request.json()) as { id: string } & Partial<CategoryInput>;
        const updated = store.updateCategory(body.id, body);
        return updated ? json(updated) : json({ error: "Not found" }, 404);
      },
      PATCH: async ({ request }) => {
        const body = (await request.json()) as { id: string } & Partial<CategoryInput>;
        const updated = store.updateCategory(body.id, body);
        return updated ? json(updated) : json({ error: "Not found" }, 404);
      },
    },
  },
});