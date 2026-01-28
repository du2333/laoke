import { nanoid } from "nanoid";
import type { User } from "../../types";

const STORAGE_KEY = "laoke_user";

export function getUser(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

export function saveUser(name: string): User {
  const user: User = {
    id: nanoid(),
    name,
    createdAt: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function updateUserName(newName: string): User | null {
  const user = getUser();
  if (!user) return null;

  const updated = { ...user, name: newName };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}
