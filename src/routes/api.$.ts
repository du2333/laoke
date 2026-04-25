import { createFileRoute } from "@tanstack/react-router";

import { rpcHandler } from "@/lib/orpc/rpc-handler";

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      ANY: async ({ request, context }) => {
        const { response } = await rpcHandler.handle(request, {
          prefix: "/api",
          context: {
            env: context.env,
          },
        });
        return response ?? new Response("Not Found", { status: 404 });
      },
    },
  },
});
