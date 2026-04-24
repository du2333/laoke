import { createServerFn } from "@tanstack/react-start";

import { verifyAdmin } from "@/features/auth/server/auth";
import { adminMiddleware } from "@/features/auth/server/middleware";

import {
  createMeetingInputSchema,
  deactivateMeetingInputSchema,
  getMeetingMetadataInputSchema,
  joinMeetingInputSchema,
  listMeetingsInputSchema,
} from "../schema";
import {
  createMeeting,
  deactivateMeeting,
  getMeetingMetadata,
  joinMeeting,
  listMeetings,
} from "./service";

const HOST_PRESET_NAME = "group_call_host";
const PARTICIPANT_PRESET_NAME = "group_call_participant";

function participantPreset(env: Env, adminToken?: string) {
  if (!adminToken) return PARTICIPANT_PRESET_NAME;

  verifyAdmin(env, adminToken);
  return HOST_PRESET_NAME;
}

export const createMeetingFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(createMeetingInputSchema)
  .handler(({ context, data }) => createMeeting(context.env, { title: data.title }));

export const getMeetingMetadataFn = createServerFn({ method: "GET" })
  .inputValidator(getMeetingMetadataInputSchema)
  .handler(({ context, data }) => getMeetingMetadata(context.env, data));

export const listMeetingsFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .inputValidator(listMeetingsInputSchema)
  .handler(({ context, data }) => listMeetings(context.env, data));

export const deactivateMeetingFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(deactivateMeetingInputSchema)
  .handler(({ context, data }) => deactivateMeeting(context.env, { meetingId: data.meetingId }));

export const joinMeetingFn = createServerFn({ method: "POST" })
  .inputValidator(joinMeetingInputSchema)
  .handler(({ context, data }) =>
    joinMeeting(context.env, {
      meetingId: data.meetingId,
      userId: data.userId,
      userName: data.userName,
      presetName: participantPreset(context.env, data.adminToken),
    }),
  );
