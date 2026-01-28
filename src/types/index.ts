export interface User {
  id: string;
  name: string;
  createdAt: number;
}

export interface MeetingSession {
  meetingId: string;
  authToken: string;
}

export type AppPage = "home" | "meeting";
