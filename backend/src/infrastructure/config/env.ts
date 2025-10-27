import { z } from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().min(1, "Database URL is required").refine((val) => {
        try {
            new URL(val);
            return true;
        } catch {
            return false;
        }
    }, { message: "DATABASE_URL must be a valid URL" })
});

export type Env = z.infer<typeof envSchema>;

// Parse and validate environment variables
export const env = envSchema.parse(process.env);