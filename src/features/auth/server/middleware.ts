import { oo } from "@orpc/openapi";

import { isAdmin } from "./auth";
import { admin } from "./procedure";

function getAdminPassword(headers: Headers) {
  const authorization = headers.get("authorization");
  if (!authorization) return null;

  const [scheme, token] = authorization.split(/\s+/, 2);
  if (scheme?.toLowerCase() !== "bearer") return null;

  return token?.trim() || null;
}

export const requireAdmin = oo.spec(
  admin.middleware(async ({ context, next, errors }) => {
    const adminPassword = getAdminPassword(context.headers);

    if (!adminPassword || !isAdmin(context.env, adminPassword)) {
      throw errors.UNAUTHORIZED();
    }

    return await next();
  }),
  { security: [{ bearerAuth: [] }] },
);

export const resolveAdmin = admin.middleware(async ({ context, next, errors }) => {
  const adminPassword = getAdminPassword(context.headers);

  if (!adminPassword) {
    return next({ context: { isAdmin: false } });
  }

  if (!isAdmin(context.env, adminPassword)) {
    throw errors.UNAUTHORIZED();
  }

  return next({ context: { isAdmin: true } });
});
