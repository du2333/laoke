import { createFileRoute } from "@tanstack/react-router";

import { openAPIHandler } from "@/lib/orpc/openapi-handler";

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      ANY: async ({ request, context }) => {
        const { response } = await openAPIHandler.handle(request, {
          prefix: "/api",
          context: {
            env: context.env,
            headers: request.headers,
          },
        });
        return response ?? new Response("Not Found", { status: 404 });
      },
    },
  },
});
