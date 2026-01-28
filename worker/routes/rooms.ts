import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { customAlphabet } from "nanoid";
import { getServerEnv } from "../lib/env";
import {
  createRoomRequestSchema,
  joinRoomRequestSchema,
  createMeetingResponseSchema,
  issueTokenResponseSchema,
  type Room,
} from "../lib/schema";
import { saveRoom, getRoom } from "../lib/kv";

// Generate 6-character uppercase room codes
const generateRoomCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export const roomsRoute = new Hono<{ Bindings: Env }>()
  // Create room
  .post("/", zValidator("json", createRoomRequestSchema), async (c) => {
    const { roomName, hostId, hostName } = c.req.valid("json");
    const { CLOUDFLARE_ACCOUNT_ID, REALTIME_APP_ID, REALTIME_API_TOKEN } =
      getServerEnv(c.env);

    // 1. Create Cloudflare Meeting
    const meetingRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/realtime/kit/${REALTIME_APP_ID}/meetings`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REALTIME_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: roomName }),
      },
    );

    if (!meetingRes.ok) {
      const err = await meetingRes.json();
      return c.json({ error: "Failed to create meeting", details: err }, 500);
    }

    const meetingData = createMeetingResponseSchema.parse(
      await meetingRes.json(),
    );
    const meetingId =
      meetingData.id ?? meetingData.result?.id ?? meetingData.data?.id;

    if (!meetingId) {
      return c.json({ error: "Meeting ID not found in response" }, 500);
    }

    // 2. Generate room code
    const roomId = generateRoomCode();

    // 3. Get auth token for host
    const tokenRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/realtime/kit/${REALTIME_APP_ID}/meetings/${meetingId}/participants`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REALTIME_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: hostName,
          custom_participant_id: hostId,
          preset_name: "group_call_host",
        }),
      },
    );

    if (!tokenRes.ok) {
      const err = await tokenRes.json();
      return c.json({ error: "Failed to issue token", details: err }, 500);
    }

    const tokenData = issueTokenResponseSchema.parse(await tokenRes.json());
    const authToken =
      tokenData.token ?? tokenData.auth_token ?? tokenData.data?.token;

    if (!authToken) {
      return c.json({ error: "Auth token not found in response" }, 500);
    }

    // 4. Save room to KV
    const room: Room = {
      id: roomId,
      name: roomName,
      meetingId,
      hostId,
      createdAt: Date.now(),
    };
    await saveRoom(c.env.ROOMS_KV, room);

    return c.json({ room, authToken });
  })

  // Get room info
  .get("/:id", async (c) => {
    const roomId = c.req.param("id").toUpperCase();
    const room = await getRoom(c.env.ROOMS_KV, roomId);

    if (!room) {
      return c.json({ error: "Room not found" }, 404);
    }

    return c.json({ room });
  })

  // Join room
  .post("/:id/join", zValidator("json", joinRoomRequestSchema), async (c) => {
    const roomId = c.req.param("id").toUpperCase();
    const { userId, userName } = c.req.valid("json");
    const { CLOUDFLARE_ACCOUNT_ID, REALTIME_APP_ID, REALTIME_API_TOKEN } =
      getServerEnv(c.env);

    // 1. Get room from KV
    const room = await getRoom(c.env.ROOMS_KV, roomId);
    if (!room) {
      return c.json({ error: "Room not found" }, 404);
    }

    // 2. Issue token for participant
    const tokenRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/realtime/kit/${REALTIME_APP_ID}/meetings/${room.meetingId}/participants`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REALTIME_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName,
          custom_participant_id: userId,
          preset_name: "group_call_participant",
        }),
      },
    );

    if (!tokenRes.ok) {
      const err = await tokenRes.json();
      return c.json({ error: "Failed to issue token", details: err }, 500);
    }

    const tokenData = issueTokenResponseSchema.parse(await tokenRes.json());
    const authToken =
      tokenData.token ?? tokenData.auth_token ?? tokenData.data?.token;

    if (!authToken) {
      return c.json({ error: "Auth token not found in response" }, 500);
    }

    return c.json({ room, authToken });
  });
