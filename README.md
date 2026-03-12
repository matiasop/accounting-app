# Accounting

A small accounting app for tracking money

You can:

- create accounting entries
- manage asset and liability accounts
- check simple reports

## Stack

TanStack Start, React, Cloudflare D1, Drizzle, and Bun.

## Run it locally

```bash
bun install
bunx wrangler d1 migrations apply accounting-db --local
bun run dev
```

Set `AUTH_PASSWORD` in `.env.local` before logging in.

## Deploy

```bash
bunx wrangler d1 migrations apply accounting-db --remote
bun run deploy
```
