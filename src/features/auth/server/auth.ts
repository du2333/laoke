import { getServerEnv } from "@/lib/env";

export function isAdmin(env: Env, adminPassword: string) {
  const { ADMIN_TOKEN } = getServerEnv(env);
  return adminPassword === ADMIN_TOKEN;
}
