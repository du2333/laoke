import { z } from "zod";

const envSchema = z.object({
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  REALTIME_APP_ID: z.string(),
  REALTIME_API_TOKEN: z.string(),
});

export const getServerEnv = (env: Env) => envSchema.parse(env);
