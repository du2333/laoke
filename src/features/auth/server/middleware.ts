import { createMiddleware } from "@tanstack/react-start";

import { adminTokenInputSchema, type AdminTokenInput } from "@/features/auth/schema";

import { isAdmin, verifyAdmin } from "./auth";
import { admin } from "./procedure";

export const adminMiddleware = createMiddleware({ type: "function" })
  .inputValidator(adminTokenInputSchema)
  .server(({ context, data, next }) => {
    verifyAdmin(context.env, data.adminToken);
    return next();
  });

export const requireAdmin = admin.middleware(
  async ({ context, next, errors }, input: AdminTokenInput) => {
    if (!isAdmin(context.env, input.adminToken)) {
      throw errors.UNAUTHORIZED();
    }
    return await next();
  },
);
