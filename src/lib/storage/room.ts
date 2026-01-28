const STORAGE_KEY = "laoke_last_room";

export function getLastRoomId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveLastRoomId(roomId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, roomId);
  } catch {
    // Ignore storage errors
  }
}

export function clearLastRoomId(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
