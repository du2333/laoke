import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import { ResponseValidationPlugin } from "@orpc/contract/plugins";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { createRouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn, getGlobalStartContext } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { getAdminPassword } from "@/features/auth/client/storage/admin-password";

import { router } from "./router";

type AppORPCClient = ContractRouterClient<typeof router>;

function adminAuthorizationHeader(adminPassword?: string): Record<string, string> {
  return adminPassword ? { Authorization: `Bearer ${adminPassword}` } : {};
}

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
          headers: getRequestHeaders(),
        };
      },
    }),
  )
  .client((): AppORPCClient => {
    const link = new OpenAPILink(router, {
      url: `${window.location.origin}/api`,
      headers: () => adminAuthorizationHeader(getAdminPassword()),
      plugins: [new ResponseValidationPlugin(router)],
    });

    return createORPCClient(link);
  });

const client: AppORPCClient = getORPCClient();

export const orpc = createTanstackQueryUtils(client);
