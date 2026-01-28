import honoApp from "./hono";

export default {
  fetch(request, env, ctx) {
    return honoApp.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
