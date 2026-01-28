import { useState, useEffect, useCallback } from "react";
import type { User } from "../types";
import { getUser, saveUser as saveUserToStorage } from "../lib/storage/user";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getUser();
    setUser(storedUser);
    setLoading(false);
  }, []);

  const saveUser = useCallback((name: string) => {
    const newUser = saveUserToStorage(name);
    setUser(newUser);
    return newUser;
  }, []);

  return { user, loading, saveUser };
}
