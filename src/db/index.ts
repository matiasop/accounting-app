import { drizzle } from "drizzle-orm/d1"
import { env } from "cloudflare:workers"

import * as schema from "./schema.ts"

export function getDb() {
	// biome-ignore lint/suspicious/noExplicitAny: Cloudflare Workers env binding
	return drizzle((env as any).accounting_db, { schema })
}
