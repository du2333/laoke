import authRouter from "@/features/auth/server/router";
import meetingRouter from "@/features/meeting/server/router";

export const router = {
  auth: authRouter,
  meeting: meetingRouter,
};
