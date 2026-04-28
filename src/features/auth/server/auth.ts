import { getServerEnv } from "@/lib/env";

export function isAdmin(env: Env, adminToken: string) {
  const { ADMIN_TOKEN } = getServerEnv(env);
  return adminToken === ADMIN_TOKEN;
}
