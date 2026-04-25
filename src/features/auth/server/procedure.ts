import { base } from "@/lib/orpc/procedure";

export const admin = base.errors({
  UNAUTHORIZED: {
    message: "Unauthorized",
    status: 401,
  },
});
