import { describe, it, expect } from "vitest"
import { calculateBalance } from "@/lib/balance"
import type { InferSelectModel } from "drizzle-orm"
import type { accounts, entries } from "@/db/schema"

type Account = InferSelectModel<typeof accounts>
type Entry = InferSelectModel<typeof entries>

function mockAccount(overrides: Partial<Account> = {}): Account {
	return {
		id: 1,
		name: "Test Account",
		type: "asset",
		priority: 5,
		createdAt: null,
		...overrides,
	}
}

function mockEntry(overrides: Partial<Entry> = {}): Entry {
	return {
		id: 1,
		date: "2025-01-01T00:00:00Z",
		description: "Test entry",
		creditAccountId: 2,
		debitAccountId: 1,
		amount: 100,
		category: "food",
		subcategory: null,
		type: "expense",
		createdAt: null,
		...overrides,
	}
}

describe("calculateBalance", () => {
	describe("asset accounts", () => {
		const assetAccount = mockAccount({ id: 1, type: "asset" })

		it("returns 0 for no entries", () => {
			expect(calculateBalance(assetAccount, [])).toBe(0)
		})

		it("increases balance when account is debited", () => {
			const entry = mockEntry({ debitAccountId: 1, creditAccountId: 2, amount: 500 })
			expect(calculateBalance(assetAccount, [entry])).toBe(500)
		})

		it("decreases balance when account is credited", () => {
			const entry = mockEntry({ debitAccountId: 2, creditAccountId: 1, amount: 300 })
			expect(calculateBalance(assetAccount, [entry])).toBe(-300)
		})

		it("sums debits and subtracts credits", () => {
			const entries = [
				mockEntry({ id: 1, debitAccountId: 1, creditAccountId: 2, amount: 1000 }),
				mockEntry({ id: 2, debitAccountId: 1, creditAccountId: 3, amount: 500 }),
				mockEntry({ id: 3, debitAccountId: 3, creditAccountId: 1, amount: 200 }),
			]
			// debits: 1000 + 500 = 1500, credits: 200
			expect(calculateBalance(assetAccount, entries)).toBe(1300)
		})

		it("ignores entries for other accounts", () => {
			const entries = [
				mockEntry({ id: 1, debitAccountId: 1, creditAccountId: 2, amount: 100 }),
				mockEntry({ id: 2, debitAccountId: 3, creditAccountId: 4, amount: 9999 }),
			]
			expect(calculateBalance(assetAccount, entries)).toBe(100)
		})
	})

	describe("liability accounts", () => {
		const liabilityAccount = mockAccount({ id: 1, type: "liability" })

		it("returns 0 for no entries", () => {
			expect(calculateBalance(liabilityAccount, [])).toBe(0)
		})

		it("increases balance when account is credited", () => {
			const entry = mockEntry({ debitAccountId: 2, creditAccountId: 1, amount: 500 })
			expect(calculateBalance(liabilityAccount, [entry])).toBe(500)
		})

		it("decreases balance when account is debited", () => {
			const entry = mockEntry({ debitAccountId: 1, creditAccountId: 2, amount: 300 })
			expect(calculateBalance(liabilityAccount, [entry])).toBe(-300)
		})

		it("computes credits minus debits", () => {
			const entries = [
				mockEntry({ id: 1, debitAccountId: 2, creditAccountId: 1, amount: 1000 }),
				mockEntry({ id: 2, debitAccountId: 1, creditAccountId: 2, amount: 400 }),
			]
			// credits: 1000, debits: 400
			expect(calculateBalance(liabilityAccount, entries)).toBe(600)
		})
	})
})
