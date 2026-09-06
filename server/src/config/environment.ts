import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from the server root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Zod schema defining all required and optional environment variables.
 * Validates types, applies defaults, and exits the process with a
 * clear error message if any required variable is missing or invalid.
 */
const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10)),

  // Database (Supabase PostgreSQL)
  DB_HOST: z.string().min(1, 'DB_HOST is required'),
  DB_PORT: z
    .string()
    .default('5432')
    .transform((val) => parseInt(val, 10)),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  DB_USER: z.string().min(1, 'DB_USER is required'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),

  // Authentication
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ADMIN_JWT_EXPIRES_IN: z.string().default('8h'),

  // Public base URL of the website, used to build admin password reset links.
  // Falls back to the first CORS origin so local development needs no extra
  // configuration.
  APP_BASE_URL: z.string().default(''),
  ADMIN_RESET_TTL_MINUTES: z
    .string()
    .default('60')
    .transform((val) => parseInt(val, 10)),

  // First super administrator, created by the seeder when the `admins` table
  // has no super administrator yet. Set SUPER_ADMIN_PASSWORD in the deployment
  // environment to avoid relying on the built-in bootstrap password, which is
  // logged on startup and must be changed after the first sign-in.
  SUPER_ADMIN_EMAIL: z.string().default('admin.hr@successcodeacademy.in'),
  SUPER_ADMIN_PASSWORD: z.string().default('Password@123'),
  SUPER_ADMIN_MOBILE_NUMBER: z.string().default('9347371746'),
  SUPER_ADMIN_NAME: z.string().default('Super Administrator'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Logging
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'http', 'debug'])
    .default('debug'),
  VAPID_PUBLIC_KEY: z.string().default(''),
  VAPID_PRIVATE_KEY: z.string().default(''),
  VAPID_SUBJECT: z.string().url().default('mailto:admin.hr@successcodeacademy.in'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:\n');
  const formatted = parsed.error.flatten();

  for (const [field, errors] of Object.entries(formatted.fieldErrors)) {
    if (errors) {
      console.error(`  ${field}: ${errors.join(', ')}`);
    }
  }

  console.error('\nSee .env.example for the required variables.');
  process.exit(1);
}

/** Validated and typed environment configuration. */
export const env = parsed.data;

/**
 * Public origin of the website. Reset links must point at the Next.js app, not
 * at this API, so it prefers APP_BASE_URL and falls back to the first
 * configured CORS origin.
 */
export function appBaseUrl(): string {
  const explicit = env.APP_BASE_URL.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  const firstOrigin = env.CORS_ORIGIN.split(',')[0]?.trim() || '';
  return firstOrigin.replace(/\/$/, '');
}

/** TypeScript type inferred from the environment schema. */
export type Env = z.infer<typeof envSchema>;
