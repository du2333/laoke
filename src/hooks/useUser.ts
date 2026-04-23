import { useState, useEffect } from "react";
import type { User } from "@/lib/schema/user";
import {
  getUser,
  saveUser as saveUserToStorage,
  updateUserName as updateUserNameInStorage,
} from "@/lib/storage/user";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getUser();
    setUser(storedUser);
    setLoading(false);
  }, []);

  function saveUser(name: string) {
    const newUser = saveUserToStorage(name);
    setUser(newUser);
    return newUser;
  }

  function updateUserName(name: string) {
    const updatedUser = updateUserNameInStorage(name);
    if (!updatedUser) return null;
    setUser(updatedUser);
    return updatedUser;
  }

  return { user, loading, saveUser, updateUserName };
}
