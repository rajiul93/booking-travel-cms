# Dream Tourism Booking Platform

Production-ready travel booking platform for **dreamtourism.it**.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Payload CMS 3
- PostgreSQL (Neon)
- Stripe
- Bókun API
- Resend Email
- Vercel + Cloudflare DNS

## Quick Start

```bash
cp .env.example .env
# Edit .env with your credentials

npm install
npm run dev
```

- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin

## Project Structure

```
src/
├── app/
│   ├── (frontend)/     # Public website
│   ├── (payload)/      # Payload CMS admin + API
│   └── api/            # Booking + webhook routes
├── collections/        # Payload CMS collections
├── components/         # React components
├── lib/
│   ├── bokun/          # Bókun HMAC client
│   ├── stripe/         # Stripe client
│   ├── booking/        # Booking orchestration
│   └── validation/     # Zod schemas
└── payload.config.ts
```

## Booking Flow

1. Customer selects date → live Bókun availability (60s cache)
2. Selects time slot + guests → live pricing
3. Reserves slot via Bókun checkout API
4. Stripe Checkout Session created (30 min expiry)
5. Payment success → confirm Bókun + store in Payload + email
6. Payment failure/expiry → auto-release Bókun reservation

## Deployment

See `.env.example` for all required environment variables.

Deploy to Vercel with Neon PostgreSQL connection string.
# booking-travel-cms
