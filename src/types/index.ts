export interface User {
  id: string;
  name: string;
  createdAt: number;
}

export interface Room {
  id: string;
  name: string;
  meetingId: string;
  hostId: string;
  createdAt: number;
}

export interface RoomSession {
  room: Room;
  authToken: string;
}

export type AppPage = "home" | "room";
