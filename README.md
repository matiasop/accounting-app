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
bun run db:local:init
bun run db:local:seed
bun run dev
```

Set `AUTH_PASSWORD` in `.env.local` before logging in.

The local seed resets the local D1 contents and loads a deterministic dataset
for February and March 2026 so you can exercise `/accounts`, `/entries`,
`/reports`, and `/reports/cash-flow`.

## Deploy

```bash
bunx wrangler d1 migrations apply accounting-db --remote
bun run deploy
```
