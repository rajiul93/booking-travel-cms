import { z } from 'zod'

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PAYLOAD_SECRET: z.string().min(32),
  DATABASE_URI: z.string().min(1),
  BOKUN_ACCESS_KEY: z.string().min(1),
  BOKUN_SECRET_KEY: z.string().min(1),
  BOKUN_BASE_URL: z.string().url().default('https://api.bokun.io'),
  BOKUN_CURRENCY: z.string().length(3).default('EUR'),
  BOKUN_LANG: z.string().min(2).default('EN'),
  BOKUN_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  RESEND_API_KEY: z.string().startsWith('re_'),
  RESEND_FROM_EMAIL: z.string().email(),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
})

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>
export type ClientEnv = z.infer<typeof clientEnvSchema>

let cachedServerEnv: ServerEnv | null = null
let cachedClientEnv: ClientEnv | null = null

export function getServerEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv
  const parsed = serverEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    throw new Error(`Invalid server environment: ${parsed.error.message}`)
  }
  cachedServerEnv = parsed.data
  return cachedServerEnv
}

export function getClientEnv(): ClientEnv {
  if (cachedClientEnv) return cachedClientEnv
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  })
  if (!parsed.success) {
    throw new Error(`Invalid client environment: ${parsed.error.message}`)
  }
  cachedClientEnv = parsed.data
  return cachedClientEnv
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
}
