import { adminTokenInputSchema } from "@/features/auth/schema";
import { requireAdmin, resolveAdmin } from "@/features/auth/server/middleware";
import { admin } from "@/features/auth/server/procedure";
import { base } from "@/lib/orpc/procedure";

import {
  createMeetingInputSchema,
  deactivateMeetingInputSchema,
  getMeetingMetadataInputSchema,
  joinMeetingInputSchema,
  listMeetingsInputSchema,
} from "../schema";
import * as meetingService from "./service";

const HOST_PRESET_NAME = "group_call_host";
const PARTICIPANT_PRESET_NAME = "group_call_participant";

export const getMeetingMetadata = base
  .input(getMeetingMetadataInputSchema)
  .handler(async ({ context, input }) => meetingService.getMeetingMetadata(context.env, input));

export const createMeeting = admin
  .input(createMeetingInputSchema.extend(adminTokenInputSchema.shape))
  .use(requireAdmin)
  .handler(async ({ context, input }) =>
    meetingService.createMeeting(context.env, { title: input.title }),
  );

export const listMeetings = admin
  .input(listMeetingsInputSchema.extend(adminTokenInputSchema.shape))
  .use(requireAdmin)
  .handler(async ({ context, input }) => meetingService.listMeetings(context.env, input));

export const deactivateMeeting = admin
  .input(deactivateMeetingInputSchema.extend(adminTokenInputSchema.shape))
  .use(requireAdmin)
  .handler(async ({ context, input }) =>
    meetingService.deactivateMeeting(context.env, { meetingId: input.meetingId }),
  );

export const joinMeeting = admin
  .input(joinMeetingInputSchema)
  .use(resolveAdmin)
  .handler(async ({ context, input }) =>
    meetingService.joinMeeting(context.env, {
      meetingId: input.meetingId,
      userId: input.userId,
      userName: input.userName,
      presetName: context.isAdmin ? HOST_PRESET_NAME : PARTICIPANT_PRESET_NAME,
    }),
  );

export const meetingRouter = {
  getMeetingMetadata,
  createMeeting,
  listMeetings,
  deactivateMeeting,
  joinMeeting,
};
