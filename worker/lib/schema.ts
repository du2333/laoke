import { z } from "zod";

export const createMeetingResponseSchema = z.object({
  id: z.string().optional(),
  result: z
    .object({
      id: z.string().optional(),
    })
    .optional(),
  data: z
    .object({
      id: z.string().optional(),
    })
    .optional(),
});

export const issueTokenResponseSchema = z.object({
  data: z
    .object({
      token: z.string(),
    })
    .optional(),
  token: z.string().optional(),
  auth_token: z.string().optional(),
});

export const presetSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  preset_id: z.string().optional(),
});
export const listPresetsResponseSchema = z
  .object({
    result: z.array(presetSchema).optional(),
    data: z.array(presetSchema).optional(),
  })
  .or(z.array(presetSchema));

export type CreateMeetingResponse = z.infer<typeof createMeetingResponseSchema>;
export type IssueTokenResponse = z.infer<typeof issueTokenResponseSchema>;
export type ListPresetsResponse = z.infer<typeof listPresetsResponseSchema>;

// Room schemas
export const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  meetingId: z.string(),
  hostId: z.string(),
  createdAt: z.number(),
});

export const createRoomRequestSchema = z.object({
  roomName: z.string().min(1).max(50),
  hostId: z.string().min(1),
  hostName: z.string().min(1).max(20),
});

export const joinRoomRequestSchema = z.object({
  userId: z.string().min(1),
  userName: z.string().min(1).max(20),
});

export type Room = z.infer<typeof roomSchema>;
export type CreateRoomRequest = z.infer<typeof createRoomRequestSchema>;
export type JoinRoomRequest = z.infer<typeof joinRoomRequestSchema>;
