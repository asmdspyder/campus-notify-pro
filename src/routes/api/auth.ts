import { createFileRoute } from "@tanstack/react-router";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

export const Route = createFileRoute("/api/auth")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { email?: string; password?: string };
        if (body.email?.trim().toLowerCase() === "admin@college.edu" && body.password === "admin123") {
          return json({
            token: "mock-token",
            user: { email: "admin@college.edu", name: "Events Administrator" },
          });
        }
        return json({ error: "Invalid email or password." }, 401);
      },
    },
  },
});