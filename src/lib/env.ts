import { z } from "zod";

const serverEnvSchema = z.object({
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  REALTIME_APP_ID: z.string(),
  REALTIME_API_TOKEN: z.string(),
  ADMIN_TOKEN: z.string().min(1),
});

export function getServerEnv(env: Env) {
  const result = serverEnvSchema.safeParse(env);

  if (!result.success) {
    throw new Error(
      `Invalid environment variables: ${JSON.stringify(z.treeifyError(result.error))}`,
    );
  }

  return result.data;
}
