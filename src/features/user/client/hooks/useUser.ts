import { useState } from "react";

import type { User } from "@/features/user/client/schema";
import {
  getUser,
  saveUser as saveUserToStorage,
  updateUserName as updateUserNameInStorage,
} from "@/features/user/client/storage/user-storage";

export function useUser() {
  const [user, setUser] = useState<User | null>(getUser);

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

  return { user, saveUser, updateUserName };
}
