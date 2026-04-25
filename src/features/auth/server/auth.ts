import { getServerEnv } from "@/lib/env";

export function verifyAdmin(env: Env, adminToken: string) {
  const { ADMIN_TOKEN } = getServerEnv(env);

  if (adminToken !== ADMIN_TOKEN) {
    throw new Error("管理密码不正确");
  }
}

export function isAdmin(env: Env, adminToken: string) {
  const { ADMIN_TOKEN } = getServerEnv(env);
  return adminToken === ADMIN_TOKEN;
}
