import "dotenv/config";
import { z } from "zod";


const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z
    .string()
    .default("8080")
    .transform(Number),

  DATABASE_URL: z.string().min(1),

  MAX_LOG_BATCH_SIZE:
  z.string()
   .default("5000")
   .transform(Number),
   
   RETENTION_DAYS: z.coerce.number().default(30),
});


export const env = envSchema.parse(process.env);