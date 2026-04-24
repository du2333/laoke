import type {
  CreateMeetingInput,
  DeactivateMeetingInput,
  GetMeetingMetadataInput,
  ListMeetingsInput,
  ManagedMeeting,
  ManagedMeetingList,
  MeetingMetadata,
  MeetingSession,
} from "../schema";
import { createRealtimeKitClient } from "./realtime-kit";

export async function createMeeting(env: Env, input: CreateMeetingInput): Promise<ManagedMeeting> {
  const realtimeKit = createRealtimeKitClient(env);
  return realtimeKit.createMeeting({ title: input.title });
}

export async function getMeetingMetadata(
  env: Env,
  input: GetMeetingMetadataInput,
): Promise<MeetingMetadata> {
  const realtimeKit = createRealtimeKitClient(env);
  return realtimeKit.getMeetingMetadata(input.meetingId);
}

export async function listMeetings(
  env: Env,
  input: ListMeetingsInput = {},
): Promise<ManagedMeetingList> {
  const realtimeKit = createRealtimeKitClient(env);
  return realtimeKit.listMeetings(input);
}

export async function deactivateMeeting(
  env: Env,
  input: DeactivateMeetingInput,
): Promise<ManagedMeeting> {
  const realtimeKit = createRealtimeKitClient(env);
  return realtimeKit.deactivateMeeting(input.meetingId);
}

export async function joinMeeting(
  env: Env,
  input: {
    meetingId: string;
    userId: string;
    userName: string;
    presetName: string;
  },
): Promise<MeetingSession> {
  const realtimeKit = createRealtimeKitClient(env);
  const authToken = await realtimeKit.issueParticipantToken({
    meetingId: input.meetingId,
    userId: input.userId,
    userName: input.userName,
    presetName: input.presetName,
  });

  return { meetingId: input.meetingId, authToken };
}
