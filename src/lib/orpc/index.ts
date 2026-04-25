import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import { ResponseValidationPlugin } from "@orpc/contract/plugins";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { createRouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn, getGlobalStartContext } from "@tanstack/react-start";

import { router } from "./router";

type AppORPCClient = ContractRouterClient<typeof router>;

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(router, {
      context: () => {
        const context = getGlobalStartContext();
        if (!context) {
          throw new Error("No global start context found");
        }
        return {
          env: context.env,
        };
      },
    }),
  )
  .client((): AppORPCClient => {
    const link = new OpenAPILink(router, {
      url: `${window.location.origin}/api`,
      plugins: [new ResponseValidationPlugin(router)],
    });

    return createORPCClient(link);
  });

export const client: AppORPCClient = getORPCClient();

export const orpc = createTanstackQueryUtils(client);
