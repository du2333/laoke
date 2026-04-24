import { createClientOnlyFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";

import { userSchema, type User } from "@/features/user/client/schema";

const STORAGE_KEY = "laoke_user";

export const getUser = createClientOnlyFn((): User | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const result = userSchema.safeParse(JSON.parse(stored));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
});

export const saveUser = createClientOnlyFn((name: string): User => {
  const user = userSchema.parse({
    id: nanoid(),
    name: name.trim(),
    createdAt: Date.now(),
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
});

export const updateUserName = createClientOnlyFn((newName: string): User | null => {
  const user = getUser();
  if (!user) return null;

  const updated = userSchema.parse({
    ...user,
    name: newName.trim(),
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
});
