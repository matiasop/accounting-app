import type { InferSelectModel } from "drizzle-orm"
import type { accounts, entries } from "@/db/schema"

type Account = InferSelectModel<typeof accounts>
type Entry = InferSelectModel<typeof entries>

export function calculateBalance(
	account: Account,
	allEntries: Entry[],
): number {
	const debits = allEntries
		.filter((e) => e.debitAccountId === account.id)
		.reduce((sum, e) => sum + e.amount, 0)

	const credits = allEntries
		.filter((e) => e.creditAccountId === account.id)
		.reduce((sum, e) => sum + e.amount, 0)

	if (account.type === "asset") {
		return debits - credits
	}
	return credits - debits
}
