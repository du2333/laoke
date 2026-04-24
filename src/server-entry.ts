import appHandler from "@tanstack/react-start/server-entry";

type ServerRequestContext = {
  env: Env;
  executionContext: ExecutionContext<unknown>;
};

declare module "@tanstack/react-start" {
  interface Register {
    server: {
      requestContext: ServerRequestContext;
    };
  }
}

export default {
  fetch(request, env, executionContext) {
    return appHandler.fetch(request, {
      context: {
        env,
        executionContext,
      },
    });
  },
} satisfies ExportedHandler<Env>;
