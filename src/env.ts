import { z, ZodError } from "zod";

import { config } from "dotenv";
import { expand } from "dotenv-expand";

expand(config());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  PGHOST: z.string(),
  PGPORT: z.coerce.number(),
  PGUSER: z.string(),
  PGPASSWORD: z.string(),
  PGDATABASE: z.string(),
  JWT_SECRET: z.string(), 
  JWT_EXPIRES_IN: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  REDIS_PASSWORD: z.string(),
  UPLOADTHING_TOKEN: z.string(),
  UPLOADTHING_SECRET: z.string(),
  LOG_LEVEL: z
  .enum(["info", "debug", "warn", "error", "fatal", "trace", "silent"])
  .default("info"),
})

export type env = z.infer<typeof envSchema>;

let env: env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    console.error("Environment variable validation failed:", error.errors);
    process.exit(1);
  }
  throw error;
}

export default env;
