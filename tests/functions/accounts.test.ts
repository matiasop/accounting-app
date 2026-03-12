import { describe, it, expect, beforeEach } from "vitest"
import { createTestDb, type TestDb } from "../helpers/db"
import {
	handleGetAccounts,
	handleGetAccount,
	handleCreateAccount,
	handleGetAccountBalance,
	handleGetAllAccountsWithBalances,
} from "@/functions/handlers/accounts"
import { handleCreateEntry } from "@/functions/handlers/entries"
import { NotFoundError } from "@/lib/errors"

describe("account handlers", () => {
	let testDb: TestDb

	beforeEach(() => {
		testDb = createTestDb()
	})

	describe("handleCreateAccount", () => {
		it("creates an asset account and returns it with id", async () => {
			const account = await handleCreateAccount(testDb.db, {
				name: "Efectivo",
				type: "asset",
			})
			expect(account.id).toBe(1)
			expect(account.name).toBe("Efectivo")
			expect(account.type).toBe("asset")
			expect(account.priority).toBe(5)
		})

		it("creates a liability account", async () => {
			const account = await handleCreateAccount(testDb.db, {
				name: "Tarjeta Visa",
				type: "liability",
			})
			expect(account.type).toBe("liability")
			expect(account.priority).toBe(5)
		})

		it("persists an explicit priority", async () => {
			const account = await handleCreateAccount(testDb.db, {
				name: "Caja chica",
				type: "asset",
				priority: 9,
			})
			expect(account.priority).toBe(9)
		})

		it("auto-increments ids", async () => {
			const a1 = await handleCreateAccount(testDb.db, { name: "A", type: "asset" })
			const a2 = await handleCreateAccount(testDb.db, { name: "B", type: "asset" })
			expect(a2.id).toBe(a1.id + 1)
		})
	})

	describe("handleGetAccounts", () => {
		it("returns empty array when no accounts exist", async () => {
			const accounts = await handleGetAccounts(testDb.db)
			expect(accounts).toEqual([])
		})

		it("returns all accounts", async () => {
			await handleCreateAccount(testDb.db, {
				name: "Efectivo",
				type: "asset",
				priority: 4,
			})
			await handleCreateAccount(testDb.db, {
				name: "Visa",
				type: "liability",
				priority: 8,
			})
			const accounts = await handleGetAccounts(testDb.db)
			expect(accounts).toHaveLength(2)
			expect(accounts.map((account) => account.name)).toEqual(["Visa", "Efectivo"])
		})

		it("orders accounts by priority descending and name ascending", async () => {
			await handleCreateAccount(testDb.db, {
				name: "Caja B",
				type: "asset",
				priority: 7,
			})
			await handleCreateAccount(testDb.db, {
				name: "Caja A",
				type: "asset",
				priority: 7,
			})
			await handleCreateAccount(testDb.db, {
				name: "Fondo",
				type: "asset",
				priority: 9,
			})

			const accounts = await handleGetAccounts(testDb.db)
			expect(accounts.map((account) => account.name)).toEqual([
				"Fondo",
				"Caja A",
				"Caja B",
			])
		})
	})

	describe("handleGetAccount", () => {
		it("returns account by id", async () => {
			const created = await handleCreateAccount(testDb.db, {
				name: "Efectivo",
				type: "asset",
			})
			const found = await handleGetAccount(testDb.db, { id: created.id })
			expect(found.name).toBe("Efectivo")
			expect(found.id).toBe(created.id)
		})

		it("throws NotFoundError when account does not exist", async () => {
			await expect(
				handleGetAccount(testDb.db, { id: 999 }),
			).rejects.toThrow(NotFoundError)
		})
	})

	describe("handleGetAccountBalance", () => {
		it("returns 0 balance for account with no entries", async () => {
			const account = await handleCreateAccount(testDb.db, {
				name: "Efectivo",
				type: "asset",
			})
			const result = await handleGetAccountBalance(testDb.db, { id: account.id })
			expect(result.balance).toBe(0)
			expect(result.account.id).toBe(account.id)
		})

		it("calculates correct asset balance (debits - credits)", async () => {
			const cash = await handleCreateAccount(testDb.db, { name: "Efectivo", type: "asset" })
			const expenses = await handleCreateAccount(testDb.db, { name: "Gastos", type: "asset" })

			// Salary received: debit cash 10000
			await handleCreateEntry(testDb.db, {
				date: "2025-01-01T09:00:00Z",
				description: "Salario",
				creditAccountId: expenses.id,
				debitAccountId: cash.id,
				amount: 10000,
				category: "income",
				subcategory: "salary",
				})

			// Groceries: credit cash 3000
			await handleCreateEntry(testDb.db, {
				date: "2025-01-02T10:00:00Z",
				description: "Supermercado",
				creditAccountId: cash.id,
				debitAccountId: expenses.id,
				amount: 3000,
				category: "food",
				subcategory: "groceries",
				})

			const result = await handleGetAccountBalance(testDb.db, { id: cash.id })
			// debits: 10000, credits: 3000 → 7000
			expect(result.balance).toBe(7000)
		})

		it("calculates correct liability balance (credits - debits)", async () => {
			const visa = await handleCreateAccount(testDb.db, { name: "Visa", type: "liability" })
			const expenses = await handleCreateAccount(testDb.db, { name: "Gastos", type: "asset" })

			// Charge to credit card: credit visa 5000
			await handleCreateEntry(testDb.db, {
				date: "2025-01-01T10:00:00Z",
				description: "Compra con tarjeta",
				creditAccountId: visa.id,
				debitAccountId: expenses.id,
				amount: 5000,
				category: "food",
				subcategory: "groceries",
				})

			// Pay credit card: debit visa 2000
			await handleCreateEntry(testDb.db, {
				date: "2025-01-15T10:00:00Z",
				description: "Pago tarjeta",
				creditAccountId: expenses.id,
				debitAccountId: visa.id,
				amount: 2000,
				category: "movement",
				subcategory: "movement",
				})

			const result = await handleGetAccountBalance(testDb.db, { id: visa.id })
			// credits: 5000, debits: 2000 → 3000
			expect(result.balance).toBe(3000)
		})

		it("throws NotFoundError when account does not exist", async () => {
			await expect(
				handleGetAccountBalance(testDb.db, { id: 999 }),
			).rejects.toThrow(NotFoundError)
		})
	})

	describe("handleGetAllAccountsWithBalances", () => {
		it("returns balances keeping priority order", async () => {
			await handleCreateAccount(testDb.db, {
				name: "Visa",
				type: "liability",
				priority: 6,
			})
			await handleCreateAccount(testDb.db, {
				name: "Ahorros",
				type: "asset",
				priority: 9,
			})
			await handleCreateAccount(testDb.db, {
				name: "Caja",
				type: "asset",
				priority: 6,
			})

			const accounts = await handleGetAllAccountsWithBalances(testDb.db)
			expect(accounts.map((account) => account.name)).toEqual([
				"Ahorros",
				"Caja",
				"Visa",
			])
		})
	})
})
