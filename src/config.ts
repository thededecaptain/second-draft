import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SLACK_SIGNING_SECRET: z.string().min(1),
  SLACK_CLIENT_ID: z.string().min(1),
  SLACK_CLIENT_SECRET: z.string().min(1),
  SLACK_STATE_SECRET: z.string().min(1),
  SLACK_APP_TOKEN: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  ANTHROPIC_MODEL: z.string().min(1).default("claude-sonnet-4-20250514"),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOCAL_ENVELOPE_MASTER_KEY: z.string().optional(),
  /** Public HTTPS base URL for user OAuth callback (ngrok in dev, production URL in prod). */
  PUBLIC_BASE_URL: z.string().url().optional(),
});

export type Config = z.infer<typeof envSchema>;

let cached: Config | null = null;

export function loadConfig(): Config {
  if (cached) return cached;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid or missing environment variables:\n${missing}`);
  }

  cached = parsed.data;
  return cached;
}
