import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production"])
    .default("development")
    .transform((val) => val.toLowerCase()),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z
    .string()
    .min(1, "Database URL is required")
    .refine(
      (val) => {
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "DATABASE_URL must be a valid URL" },
    ),
  OTEL_SERVICE_NAME: z.string().min(1, "OTEL_SERVICE_NAME is required"),
  ENABLE_TRACING: z
    .string()
    .default("false")
    .transform((val) => val === "true"),
  METRICS_ENABLED: z
    .string()
    .default("false")
    .transform((val) => val === "true"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  LOGGER_PRETTY: z
    .string()
    .default("false")
    .transform((val) => val === "true"),
  JWT_SECRET: z
    .string()
    .min(1, "JWT_SECRET is required")
    .min(32, "JWT_SECRET must be at least 32 characters long"),
  AI_SERVICE_URL: z
    .string()
    .url("Invalid AI_SERVICE_URL")
    .optional()
    .default("http://localhost:8000"),
  AWS_ACCESS_KEY_ID: z
    .string()
    .min(1, "AWS_ACCESS_KEY_ID is required for S3 operations"),
  AWS_SECRET_ACCESS_KEY: z
    .string()
    .min(1, "AWS_SECRET_ACCESS_KEY is required for S3 operations"),
  AWS_S3_BUCKET: z
    .string()
    .min(1, "AWS_S3_BUCKET is required for document storage"),
  AWS_S3_REGION: z.string().default("us-east-1"),
});

export type Env = z.infer<typeof envSchema>;

// Parse and validate environment variables
export const env = envSchema.parse(process.env);
