import { describe, it, expect, beforeEach } from "vitest"
import { createTestDb, type TestDb } from "../helpers/db"
import {
	handleGetEntries,
	handleGetEntriesWithAccounts,
	handleGetEntry,
	handleCreateEntry,
	handleUpdateEntry,
	handleDeleteEntry,
} from "@/functions/handlers/entries"
import { handleCreateAccount } from "@/functions/handlers/accounts"
import { NotFoundError } from "@/lib/errors"

describe("entry handlers", () => {
	let testDb: TestDb
	let cashId: number
	let incomeAccountId: number
	let expensesAccountId: number

	beforeEach(async () => {
		testDb = createTestDb()
		const cash = await handleCreateAccount(testDb.db, { name: "Efectivo", type: "asset" })
		cashId = cash.id

		// Create special accounts via raw SQL since handleCreateAccount doesn't accept specialRole
		testDb.sqlite.exec(
			`INSERT INTO accounts (name, type, special_role) VALUES ('Income', 'liability', 'income')`,
		)
		testDb.sqlite.exec(
			`INSERT INTO accounts (name, type, special_role) VALUES ('Expenses', 'asset', 'expenses')`,
		)
		const incomeRow = testDb.sqlite.prepare(`SELECT id FROM accounts WHERE special_role = 'income'`).get() as { id: number }
		const expensesRow = testDb.sqlite.prepare(`SELECT id FROM accounts WHERE special_role = 'expenses'`).get() as { id: number }
		incomeAccountId = incomeRow.id
		expensesAccountId = expensesRow.id
	})

	describe("handleCreateEntry", () => {
		it("creates a valid entry and returns it", async () => {
			const entry = await handleCreateEntry(testDb.db, {
				date: "2025-01-15T10:00:00Z",
				description: "Compra supermercado",
				creditAccountId: cashId,
				debitAccountId: expensesAccountId,
				amount: 5000,
				category: "food",
				subcategory: "groceries",
			})
			expect(entry.id).toBe(1)
			expect(entry.amount).toBe(5000)
			expect(entry.creditAccountId).toBe(cashId)
			expect(entry.debitAccountId).toBe(expensesAccountId)
			expect(entry.category).toBe("food")
			expect(entry.type).toBe("expense")
		})

		it("auto-computes type as movement when neither account is special", async () => {
			const savings = await handleCreateAccount(testDb.db, { name: "Ahorros", type: "asset" })
			const entry = await handleCreateEntry(testDb.db, {
				date: "2025-01-15T10:00:00Z",
				description: "Transfer",
				creditAccountId: cashId,
				debitAccountId: savings.id,
				amount: 1000,
				category: "movement",
			})
			expect(entry.type).toBe("movement")
		})

		it("auto-computes type as income when credit account is income", async () => {
			const entry = await handleCreateEntry(testDb.db, {
				date: "2025-01-15T10:00:00Z",
				description: "Salary received",
				creditAccountId: incomeAccountId,
				debitAccountId: cashId,
				amount: 50000,
				category: "income",
				subcategory: "salary",
			})
			expect(entry.type).toBe("income")
		})

		it("auto-computes type as expense when debit account is expenses", async () => {
			const entry = await handleCreateEntry(testDb.db, {
				date: "2025-01-15T10:00:00Z",
				description: "Grocery purchase",
				creditAccountId: cashId,
				debitAccountId: expensesAccountId,
				amount: 3000,
				category: "food",
			})
			expect(entry.type).toBe("expense")
		})

		it("computes movement for asset-to-liability without special roles", async () => {
			const visa = await handleCreateAccount(testDb.db, { name: "Visa", type: "liability" })
			const entry = await handleCreateEntry(testDb.db, {
				date: "2025-01-15T10:00:00Z",
				description: "Pay credit card",
				creditAccountId: visa.id,
				debitAccountId: cashId,
				amount: 10000,
				category: "movement",
			})
			expect(entry.type).toBe("movement")
		})

		it("rejects entries between two special accounts", async () => {
			await expect(
				handleCreateEntry(testDb.db, {
					date: "2025-01-15T10:00:00Z",
					description: "Invalid",
					creditAccountId: incomeAccountId,
					debitAccountId: expensesAccountId,
					amount: 1000,
					category: "food",
				}),
			).rejects.toThrow("Cannot create an entry between two special accounts")
		})

		it("creates entry without subcategory", async () => {
			const entry = await handleCreateEntry(testDb.db, {
				date: "2025-01-15T10:00:00Z",
				description: "Gasto generico",
				creditAccountId: cashId,
				debitAccountId: expensesAccountId,
				amount: 1000,
				category: "food",
			})
			expect(entry.subcategory).toBeNull()
		})

		it("throws NotFoundError when credit account does not exist", async () => {
			await expect(
				handleCreateEntry(testDb.db, {
					date: "2025-01-15T10:00:00Z",
					description: "Test",
					creditAccountId: 999,
					debitAccountId: expensesAccountId,
					amount: 100,
					category: "food",
				}),
			).rejects.toThrow(NotFoundError)
		})

		it("throws NotFoundError when debit account does not exist", async () => {
			await expect(
				handleCreateEntry(testDb.db, {
					date: "2025-01-15T10:00:00Z",
					description: "Test",
					creditAccountId: cashId,
					debitAccountId: 999,
					amount: 100,
					category: "food",
				}),
			).rejects.toThrow(NotFoundError)
		})
	})

	describe("handleGetEntries", () => {
		beforeEach(async () => {
			// income: debit=cash, credit=income
			await handleCreateEntry(testDb.db, {
				date: "2025-01-10T09:00:00Z",
				description: "Salario enero",
				creditAccountId: incomeAccountId,
				debitAccountId: cashId,
				amount: 50000,
				category: "income",
				subcategory: "salary",
			})
			// expense: debit=expenses, credit=cash
			await handleCreateEntry(testDb.db, {
				date: "2025-01-15T10:00:00Z",
				description: "Supermercado",
				creditAccountId: cashId,
				debitAccountId: expensesAccountId,
				amount: 3000,
				category: "food",
				subcategory: "groceries",
			})
			// movement: debit=cash, credit=cash (different account, no special role)
			const savings = await handleCreateAccount(testDb.db, { name: "Ahorros", type: "asset" })
			await handleCreateEntry(testDb.db, {
				date: "2025-01-20T18:00:00Z",
				description: "Transferencia ahorros",
				creditAccountId: cashId,
				debitAccountId: savings.id,
				amount: 2000,
				category: "movement",
			})
		})

		it("returns all entries when no filter provided", async () => {
			const entries = await handleGetEntries(testDb.db)
			expect(entries).toHaveLength(3)
		})

		it("returns entries ordered by date descending", async () => {
			const entries = await handleGetEntries(testDb.db)
			expect(entries[0].date).toBe("2025-01-20T18:00:00Z")
			expect(entries[2].date).toBe("2025-01-10T09:00:00Z")
		})

		it("filters entries by accountId", async () => {
			const entries = await handleGetEntries(testDb.db, { accountId: cashId })
			// All 3 entries involve cash
			expect(entries).toHaveLength(3)
		})

		it("filters entries by category", async () => {
			const entries = await handleGetEntries(testDb.db, { category: "food" })
			expect(entries).toHaveLength(1)
			expect(entries[0].category).toBe("food")
		})

		it("filters entries by type", async () => {
			const entries = await handleGetEntries(testDb.db, { type: "income" })
			expect(entries).toHaveLength(1)
			expect(entries[0].description).toBe("Salario enero")
		})

		it("filters entries by expense type", async () => {
			const entries = await handleGetEntries(testDb.db, { type: "expense" })
			expect(entries).toHaveLength(1)
			expect(entries[0].description).toBe("Supermercado")
		})

		it("filters entries by movement type", async () => {
			const entries = await handleGetEntries(testDb.db, { type: "movement" })
			expect(entries).toHaveLength(1)
			expect(entries[0].description).toBe("Transferencia ahorros")
		})

		it("combines multiple filters", async () => {
			const entries = await handleGetEntries(testDb.db, {
				category: "food",
				type: "expense",
			})
			expect(entries).toHaveLength(1)
			expect(entries[0].description).toBe("Supermercado")
		})

		it("returns empty array when no entries match", async () => {
			const entries = await handleGetEntries(testDb.db, { category: "wellness" })
			expect(entries).toHaveLength(0)
		})

		it("accepts empty filter object", async () => {
			const entries = await handleGetEntries(testDb.db, {})
			expect(entries).toHaveLength(3)
		})

		describe("date range filtering", () => {
			it("filters by dateFrom — returns entries on or after the date", async () => {
				const entries = await handleGetEntries(testDb.db, { dateFrom: "2025-01-15" })
				expect(entries).toHaveLength(2)
				for (const e of entries) {
					expect(e.date >= "2025-01-15T00:00:00Z").toBe(true)
				}
			})

			it("filters by dateTo — returns entries on or before the date", async () => {
				const entries = await handleGetEntries(testDb.db, { dateTo: "2025-01-15" })
				expect(entries).toHaveLength(2)
				for (const e of entries) {
					expect(e.date <= "2025-01-15T23:59:59Z").toBe(true)
				}
			})

			it("filters by both dateFrom and dateTo — returns only entries within range", async () => {
				const entries = await handleGetEntries(testDb.db, {
					dateFrom: "2025-01-12",
					dateTo: "2025-01-18",
				})
				expect(entries).toHaveLength(1)
				expect(entries[0].description).toBe("Supermercado")
			})

			it("returns empty array when range excludes all entries", async () => {
				const entries = await handleGetEntries(testDb.db, {
					dateFrom: "2025-02-01",
					dateTo: "2025-02-28",
				})
				expect(entries).toHaveLength(0)
			})

			it("combines date range with type filter", async () => {
				const entries = await handleGetEntries(testDb.db, {
					dateFrom: "2025-01-15",
					type: "expense",
				})
				expect(entries).toHaveLength(1)
				expect(entries[0].description).toBe("Supermercado")
			})
		})
	})

	describe("handleGetEntriesWithAccounts", () => {
		beforeEach(async () => {
			await handleCreateEntry(testDb.db, {
				date: "2025-01-15T10:00:00Z",
				description: "Test entry",
				creditAccountId: cashId,
				debitAccountId: expensesAccountId,
				amount: 1000,
				category: "food",
			})
		})

		it("returns entries with account names", async () => {
			const entries = await handleGetEntriesWithAccounts(testDb.db)
			expect(entries).toHaveLength(1)
			expect(entries[0].creditAccountName).toBe("Efectivo")
			expect(entries[0].debitAccountName).toBe("Expenses")
		})

		it("applies filters", async () => {
			const entries = await handleGetEntriesWithAccounts(testDb.db, { type: "income" })
			expect(entries).toHaveLength(0)
		})
	})

	describe("handleGetEntry", () => {
		it("returns entry by id", async () => {
			const created = await handleCreateEntry(testDb.db, {
				date: "2025-01-15T10:00:00Z",
				description: "Test entry",
				creditAccountId: cashId,
				debitAccountId: expensesAccountId,
				amount: 1000,
				category: "food",
			})
			const entry = await handleGetEntry(testDb.db, { id: created.id })
			expect(entry.id).toBe(created.id)
			expect(entry.description).toBe("Test entry")
		})

		it("throws NotFoundError for nonexistent id", async () => {
			await expect(
				handleGetEntry(testDb.db, { id: 999 }),
			).rejects.toThrow(NotFoundError)
		})
	})

	describe("handleUpdateEntry", () => {
		let entryId: number

		beforeEach(async () => {
			const entry = await handleCreateEntry(testDb.db, {
				date: "2025-01-15T10:00:00Z",
				description: "Original",
				creditAccountId: cashId,
				debitAccountId: expensesAccountId,
				amount: 1000,
				category: "food",
			})
			entryId = entry.id
		})

		it("updates entry fields and returns updated entry", async () => {
			const updated = await handleUpdateEntry(testDb.db, {
				id: entryId,
				date: "2025-02-01T12:00:00Z",
				description: "Updated",
				creditAccountId: cashId,
				debitAccountId: expensesAccountId,
				amount: 2000,
				category: "food",
				subcategory: "groceries",
			})
			expect(updated.description).toBe("Updated")
			expect(updated.amount).toBe(2000)
			expect(updated.date).toBe("2025-02-01T12:00:00Z")
			expect(updated.category).toBe("food")
		})

		it("recomputes type when accounts change", async () => {
			// Change from expense (expenses account) to income (income account)
			const updated = await handleUpdateEntry(testDb.db, {
				id: entryId,
				date: "2025-01-15T10:00:00Z",
				description: "Updated to income",
				creditAccountId: incomeAccountId,
				debitAccountId: cashId,
				amount: 1000,
				category: "income",
			})
			expect(updated.type).toBe("income")
		})

		it("throws NotFoundError for nonexistent entry", async () => {
			await expect(
				handleUpdateEntry(testDb.db, {
					id: 999,
					date: "2025-01-15T10:00:00Z",
					description: "Test",
					creditAccountId: cashId,
					debitAccountId: expensesAccountId,
					amount: 100,
					category: "food",
				}),
			).rejects.toThrow(NotFoundError)
		})

		it("throws NotFoundError for nonexistent credit account", async () => {
			await expect(
				handleUpdateEntry(testDb.db, {
					id: entryId,
					date: "2025-01-15T10:00:00Z",
					description: "Test",
					creditAccountId: 999,
					debitAccountId: expensesAccountId,
					amount: 100,
					category: "food",
				}),
			).rejects.toThrow(NotFoundError)
		})

		it("throws NotFoundError for nonexistent debit account", async () => {
			await expect(
				handleUpdateEntry(testDb.db, {
					id: entryId,
					date: "2025-01-15T10:00:00Z",
					description: "Test",
					creditAccountId: cashId,
					debitAccountId: 999,
					amount: 100,
					category: "food",
				}),
			).rejects.toThrow(NotFoundError)
		})
	})

	describe("handleDeleteEntry", () => {
		let entryId: number

		beforeEach(async () => {
			const entry = await handleCreateEntry(testDb.db, {
				date: "2025-01-15T10:00:00Z",
				description: "To delete",
				creditAccountId: cashId,
				debitAccountId: expensesAccountId,
				amount: 1000,
				category: "food",
			})
			entryId = entry.id
		})

		it("deletes entry and returns success", async () => {
			const result = await handleDeleteEntry(testDb.db, { id: entryId })
			expect(result.success).toBe(true)
			expect(result.id).toBe(entryId)
		})

		it("entry is no longer returned after deletion", async () => {
			await handleDeleteEntry(testDb.db, { id: entryId })
			const entries = await handleGetEntries(testDb.db)
			expect(entries).toHaveLength(0)
		})

		it("throws NotFoundError for nonexistent entry", async () => {
			await expect(
				handleDeleteEntry(testDb.db, { id: 999 }),
			).rejects.toThrow(NotFoundError)
		})
	})
})
