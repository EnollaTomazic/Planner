import { z } from "zod";

const serverEnvSchema = z.object({
  GITHUB_PAGES: z.string().optional(),
  NEXT_PHASE: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SKIP_PREVIEW_STATIC: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function loadServerEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  return serverEnvSchema.parse({
    GITHUB_PAGES: source.GITHUB_PAGES,
    NEXT_PHASE: source.NEXT_PHASE,
    NODE_ENV: source.NODE_ENV,
    SKIP_PREVIEW_STATIC: source.SKIP_PREVIEW_STATIC,
  });
}
