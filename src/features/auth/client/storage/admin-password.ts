import { createClientOnlyFn } from "@tanstack/react-start";

const STORAGE_KEY = "laoke-admin-password";

export const getAdminPassword = createClientOnlyFn(() => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
});

export const saveAdminPassword = createClientOnlyFn((adminPassword: string) => {
  localStorage.setItem(STORAGE_KEY, adminPassword);
});

export const clearAdminPassword = createClientOnlyFn(() => {
  localStorage.removeItem(STORAGE_KEY);
});
