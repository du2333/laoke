import type { AdminTokenInput } from "@/features/auth/schema";

import { isAdmin } from "./auth";
import { admin } from "./procedure";

export const requireAdmin = admin.middleware(
  async ({ context, next, errors }, input: AdminTokenInput) => {
    if (!isAdmin(context.env, input.adminToken)) {
      throw errors.UNAUTHORIZED();
    }
    return await next();
  },
);

export const resolveAdmin = admin.middleware(
  async ({ context, next, errors }, input: { adminToken?: string }) => {
    if (!input.adminToken) {
      return next({ context: { isAdmin: false } });
    }

    if (!isAdmin(context.env, input.adminToken)) {
      throw errors.UNAUTHORIZED();
    }

    return next({ context: { isAdmin: true } });
  },
);
