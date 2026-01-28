import type { Room } from "./schema";

const ROOM_PREFIX = "room:";

export async function saveRoom(kv: KVNamespace, room: Room): Promise<void> {
  await kv.put(`${ROOM_PREFIX}${room.id}`, JSON.stringify(room));
}

export async function getRoom(
  kv: KVNamespace,
  roomId: string,
): Promise<Room | null> {
  const data = await kv.get(`${ROOM_PREFIX}${roomId}`);
  if (!data) return null;
  return JSON.parse(data) as Room;
}

export async function deleteRoom(
  kv: KVNamespace,
  roomId: string,
): Promise<void> {
  await kv.delete(`${ROOM_PREFIX}${roomId}`);
}
