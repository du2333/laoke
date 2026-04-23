import { z } from "zod";

export const appPageSchema = z.enum(["home", "meeting"]);

export type AppPage = z.infer<typeof appPageSchema>;
