# AIowuka personal site

Personal website source for **AIowuka**, deployed on Vercel and served from `aiowuka.me`.

## Stack

- Next.js 16 App Router
- Vercel
- Supabase Auth + Postgres + RLS

## Access model

- `PUBLIC` — anyone
- `MEMBER` — authenticated and owner-approved members
- `SELECTED` — approved members explicitly granted access to an item
- `OWNER` — site owner only

Authentication alone does **not** grant member access. Database RLS is the authorization boundary.

## Environment

Copy `.env.example` to `.env.local` and configure the Supabase project URL and publishable key. Never commit secret/service-role keys.
