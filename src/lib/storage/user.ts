import { nanoid } from "nanoid";
import { userNameSchema, userSchema, type User } from "../schema/user";

const STORAGE_KEY = "laoke_user";

export function getUser(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const result = userSchema.safeParse(JSON.parse(stored));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function saveUser(name: string): User {
  const normalizedName = userNameSchema.parse(name);
  const user = userSchema.parse({
    id: nanoid(),
    name: normalizedName,
    createdAt: Date.now(),
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function updateUserName(newName: string): User | null {
  const user = getUser();
  if (!user) return null;

  const updated = userSchema.parse({
    ...user,
    name: userNameSchema.parse(newName),
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}
