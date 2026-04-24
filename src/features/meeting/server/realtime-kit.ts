import { z } from "zod";

import { getServerEnv } from "@/lib/env";

import type { ManagedMeeting, MeetingId, MeetingMetadata } from "../schema";

const issueTokenResponseSchema = z.object({
  data: z
    .object({
      token: z.string(),
    })
    .optional(),
  token: z.string().optional(),
  auth_token: z.string().optional(),
});

const meetingResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
    title: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
  }),
});

const meetingMetadataResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
    status: z.string().optional(),
    created_at: z.string().optional(),
  }),
});

const meetingListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(
    z.object({
      id: z.string(),
      title: z.string().nullable().optional(),
      status: z.string().nullable().optional(),
      created_at: z.string().nullable().optional(),
    }),
  ),
  paging: z
    .object({
      total_count: z.number().nonnegative(),
      start_offset: z.number(),
      end_offset: z.number(),
    })
    .optional(),
});

const activeSessionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    live_participants: z.number(),
  }),
});

function mapMeeting(meeting: {
  id: string;
  title?: string | null;
  status?: string | null;
  created_at?: string | null;
}): ManagedMeeting {
  return {
    meetingId: meeting.id,
    meetingTitle: meeting.title ?? null,
    status: meeting.status ?? null,
    createdAt: meeting.created_at ?? null,
  };
}

function meetingsQuery(input: { pageNo?: number; perPage?: number }) {
  const params = new URLSearchParams();
  if (input.pageNo !== undefined) params.set("page_no", String(input.pageNo));
  if (input.perPage !== undefined) params.set("per_page", String(input.perPage));

  const query = params.toString();
  return query ? `/meetings?${query}` : "/meetings";
}

function nextPageNo(input: { pageNo?: number; perPage?: number }, totalCount?: number) {
  if (totalCount === undefined || input.perPage === undefined) return null;

  const pageNo = input.pageNo ?? 1;
  return pageNo * input.perPage < totalCount ? pageNo + 1 : null;
}

async function readErrorResponse(res: Response) {
  return res.json().catch(() => null);
}

function formatDetails(details: unknown) {
  if (!details) {
    return "";
  }

  return `：${JSON.stringify(details)}`;
}

export function createRealtimeKitClient(env: Env) {
  const { CLOUDFLARE_ACCOUNT_ID, REALTIME_APP_ID, REALTIME_API_TOKEN } = getServerEnv(env);

  const url = (path = "") =>
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/realtime/kit/${REALTIME_APP_ID}${path}`;

  const headers = {
    Authorization: `Bearer ${REALTIME_API_TOKEN}`,
    "Content-Type": "application/json",
  };

  async function request(path: string, init?: RequestInit) {
    return fetch(url(path), {
      ...init,
      headers: {
        ...headers,
        ...init?.headers,
      },
    });
  }

  return {
    async getMeetingMetadata(meetingId: MeetingId): Promise<MeetingMetadata> {
      const meetingRes = await request(`/meetings/${meetingId}`);

      if (!meetingRes.ok) {
        const details = await readErrorResponse(meetingRes);
        throw new Error(`获取会议信息失败${formatDetails(details)}`);
      }

      const meetingData = meetingMetadataResponseSchema.parse(await meetingRes.json());
      const meeting = meetingData.data;

      const activeSessionRes = await request(`/meetings/${meetingId}/active-session`);

      let liveParticipants = 0;
      if (activeSessionRes.ok) {
        const activeSessionData = activeSessionResponseSchema.parse(await activeSessionRes.json());
        liveParticipants = Math.max(0, Math.trunc(activeSessionData.data.live_participants));
      } else if (activeSessionRes.status !== 404) {
        const details = await readErrorResponse(activeSessionRes);
        throw new Error(`获取会议在线状态失败${formatDetails(details)}`);
      }

      return {
        meetingId: meeting.id,
        meetingTitle: meeting.title ?? null,
        liveParticipants,
      };
    },

    async listMeetings(
      input: { pageNo?: number; perPage?: number } = {},
    ): Promise<{ meetings: Array<ManagedMeeting>; nextPageNo: number | null }> {
      const res = await request(meetingsQuery(input));

      if (!res.ok) {
        const details = await readErrorResponse(res);
        throw new Error(`获取会议列表失败${formatDetails(details)}`);
      }

      const meetingsData = meetingListResponseSchema.parse(await res.json());
      return {
        meetings: meetingsData.data.map(mapMeeting),
        nextPageNo: nextPageNo(input, meetingsData.paging?.total_count),
      };
    },

    async createMeeting(input: { title: string }): Promise<ManagedMeeting> {
      const res = await request("/meetings", {
        method: "POST",
        body: JSON.stringify({ title: input.title }),
      });

      if (!res.ok) {
        const details = await readErrorResponse(res);
        throw new Error(`创建会议失败${formatDetails(details)}`);
      }

      const meetingData = meetingResponseSchema.parse(await res.json());
      return mapMeeting(meetingData.data);
    },

    async issueParticipantToken(input: {
      meetingId: MeetingId;
      userId: string;
      userName: string;
      presetName: string;
    }): Promise<string> {
      const res = await request(`/meetings/${input.meetingId}/participants`, {
        method: "POST",
        body: JSON.stringify({
          name: input.userName,
          custom_participant_id: input.userId,
          preset_name: input.presetName,
        }),
      });

      if (!res.ok) {
        const details = await readErrorResponse(res);
        throw new Error(`加入失败${formatDetails(details)}`);
      }

      const tokenData = issueTokenResponseSchema.parse(await res.json());
      const authToken = tokenData.token ?? tokenData.auth_token ?? tokenData.data?.token;

      if (!authToken) {
        throw new Error("获取 token 失败");
      }

      return authToken;
    },

    async deactivateMeeting(meetingId: MeetingId): Promise<ManagedMeeting> {
      const res = await request(`/meetings/${meetingId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "INACTIVE" }),
      });

      if (!res.ok) {
        const details = await readErrorResponse(res);
        throw new Error(`停用会议失败${formatDetails(details)}`);
      }

      const meetingData = meetingResponseSchema.parse(await res.json());
      return mapMeeting(meetingData.data);
    },
  };
}
