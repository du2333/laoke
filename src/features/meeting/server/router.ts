import { requireAdmin, resolveAdmin } from "@/features/auth/server/middleware";
import { admin } from "@/features/auth/server/procedure";
import { base } from "@/lib/orpc/procedure";

import {
  createMeetingInputSchema,
  deactivateMeetingInputSchema,
  getMeetingMetadataInputSchema,
  joinMeetingInputSchema,
  listMeetingsInputSchema,
  managedMeetingListOutputSchema,
  managedMeetingOutputSchema,
  meetingMetadataOutputSchema,
  meetingSessionOutputSchema,
} from "../schema";
import * as meetingService from "./service";

const HOST_PRESET_NAME = "group_call_host";
const PARTICIPANT_PRESET_NAME = "group_call_participant";

const getMeetingMetadata = base
  .route({
    method: "GET",
    path: "/meetings/{meetingId}/metadata",
    summary: "Get meeting metadata",
    tags: ["Meetings"],
  })
  .input(getMeetingMetadataInputSchema)
  .output(meetingMetadataOutputSchema)
  .handler(async ({ context, input }) => meetingService.getMeetingMetadata(context.env, input));

const createMeeting = admin
  .route({
    method: "POST",
    path: "/admin/meetings",
    summary: "Create meeting",
    tags: ["Admin", "Meetings"],
  })
  .input(createMeetingInputSchema)
  .output(managedMeetingOutputSchema)
  .use(requireAdmin)
  .handler(async ({ context, input }) =>
    meetingService.createMeeting(context.env, { title: input.title }),
  );

const listMeetings = admin
  .route({
    method: "GET",
    path: "/admin/meetings",
    summary: "List meetings",
    tags: ["Admin", "Meetings"],
  })
  .input(listMeetingsInputSchema)
  .output(managedMeetingListOutputSchema)
  .use(requireAdmin)
  .handler(async ({ context, input }) => meetingService.listMeetings(context.env, input));

const deactivateMeeting = admin
  .route({
    method: "POST",
    path: "/admin/meetings/{meetingId}/deactivate",
    summary: "Deactivate meeting",
    tags: ["Admin", "Meetings"],
  })
  .input(deactivateMeetingInputSchema)
  .output(managedMeetingOutputSchema)
  .use(requireAdmin)
  .handler(async ({ context, input }) =>
    meetingService.deactivateMeeting(context.env, { meetingId: input.meetingId }),
  );

const joinMeeting = admin
  .route({
    method: "POST",
    path: "/meetings/{meetingId}/join",
    summary: "Join meeting",
    tags: ["Meetings"],
  })
  .input(joinMeetingInputSchema)
  .output(meetingSessionOutputSchema)
  .use(resolveAdmin)
  .handler(async ({ context, input }) =>
    meetingService.joinMeeting(context.env, {
      meetingId: input.meetingId,
      userId: input.userId,
      userName: input.userName,
      presetName: context.isAdmin ? HOST_PRESET_NAME : PARTICIPANT_PRESET_NAME,
    }),
  );

export default {
  getMeetingMetadata,
  createMeeting,
  listMeetings,
  deactivateMeeting,
  joinMeeting,
};
