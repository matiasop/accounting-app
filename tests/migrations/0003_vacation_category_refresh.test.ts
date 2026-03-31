import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { createTestDb } from "../helpers/db"

const migrationSql = readFileSync(
	new URL("../../drizzle/0003_vacation_category_refresh.sql", import.meta.url),
	"utf8",
)

describe("0003_vacation_category_refresh migration", () => {
	it("migrates legacy vacation rows and clears invalid subcategories", () => {
		const { sqlite } = createTestDb()

		sqlite.exec(`
			INSERT INTO accounts (id, name, type) VALUES
				(1, 'Cash', 'asset'),
				(2, 'Expenses', 'asset')
		`)

		sqlite.exec(`
			INSERT INTO entries (
				date,
				description,
				credit_account_id,
				debit_account_id,
				amount,
				category,
				subcategory,
				type
			) VALUES
				('2025-01-01T10:00:00Z', 'Legacy vacation', 1, 2, 1000, 'entertainment', 'vacation', 'expense'),
				('2025-01-02T10:00:00Z', 'Invalid food', 1, 2, 1000, 'food', 'gas', 'expense'),
				('2025-01-03T10:00:00Z', 'Invalid vacation', 1, 2, 1000, 'vacation', 'invalid_value', 'expense'),
				('2025-01-04T10:00:00Z', 'Unknown category', 1, 2, 1000, 'unknown_category', 'mystery', 'expense')
		`)

		sqlite.exec(migrationSql)

		const migratedVacation = sqlite
			.prepare(
				`SELECT category, subcategory FROM entries WHERE description = 'Legacy vacation'`,
			)
			.get() as { category: string; subcategory: string | null }
		expect(migratedVacation).toEqual({
			category: "vacation",
			subcategory: "uncategorized",
		})

		const invalidFood = sqlite
			.prepare(
				`SELECT category, subcategory FROM entries WHERE description = 'Invalid food'`,
			)
			.get() as { category: string; subcategory: string | null }
		expect(invalidFood).toEqual({
			category: "food",
			subcategory: null,
		})

		const invalidVacation = sqlite
			.prepare(
				`SELECT category, subcategory FROM entries WHERE description = 'Invalid vacation'`,
			)
			.get() as { category: string; subcategory: string | null }
		expect(invalidVacation).toEqual({
			category: "vacation",
			subcategory: "uncategorized",
		})

		const unknownCategory = sqlite
			.prepare(
				`SELECT category, subcategory FROM entries WHERE description = 'Unknown category'`,
			)
			.get() as { category: string; subcategory: string | null }
		expect(unknownCategory).toEqual({
			category: "unknown_category",
			subcategory: "mystery",
		})
	})
})
