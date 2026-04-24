import { createMiddleware } from "@tanstack/react-start";

import { adminTokenInputSchema } from "@/features/auth/schema";

import { verifyAdmin } from "./auth";

export const adminMiddleware = createMiddleware({ type: "function" })
  .inputValidator(adminTokenInputSchema)
  .server(({ context, data, next }) => {
    verifyAdmin(context.env, data.adminToken);
    return next();
  });
