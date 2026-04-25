import { createClientOnlyFn } from "@tanstack/react-start";

const STORAGE_KEY = "laoke-admin-token";

export const getAdminToken = createClientOnlyFn(() => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
});

export const saveAdminToken = createClientOnlyFn((adminToken: string) => {
  localStorage.setItem(STORAGE_KEY, adminToken);
});

export const clearAdminToken = createClientOnlyFn(() => {
  localStorage.removeItem(STORAGE_KEY);
});
