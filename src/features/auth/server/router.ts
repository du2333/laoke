import { adminPasswordInputSchema, verifyAdminPasswordOutputSchema } from "../schema";
import { isAdmin } from "./auth";
import { admin } from "./procedure";

const verifyAdminPassword = admin
  .route({
    method: "POST",
    path: "/admin/verify-password",
    summary: "Verify admin password",
    tags: ["Admin"],
  })
  .input(adminPasswordInputSchema)
  .output(verifyAdminPasswordOutputSchema)
  .handler(({ context, input, errors }) => {
    if (!isAdmin(context.env, input.adminPassword)) {
      throw errors.UNAUTHORIZED();
    }

    return { ok: true as const };
  });

export default {
  verifyAdminPassword,
};
