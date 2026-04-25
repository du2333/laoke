import { adminTokenInputSchema } from "@/features/auth/schema";
import { requireAdmin } from "@/features/auth/server/middleware";
import { admin } from "@/features/auth/server/procedure";
import { base } from "@/lib/orpc/procedure";

import { createMeetingInputSchema, getMeetingMetadataInputSchema } from "../schema";
import * as meetingService from "./service";

export const getMeetingMetadata = base
  .input(getMeetingMetadataInputSchema)
  .handler(async ({ context, input }) => meetingService.getMeetingMetadata(context.env, input));

export const createMeeting = admin
  .input(createMeetingInputSchema.extend(adminTokenInputSchema.shape))
  .use(requireAdmin)
  .handler(async ({ context, input }) =>
    meetingService.createMeeting(context.env, { title: input.title }),
  );

export const meetingRouter = {
  getMeetingMetadata,
  createMeeting,
};
