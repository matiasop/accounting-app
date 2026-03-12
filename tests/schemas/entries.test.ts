import { describe, it, expect } from "vitest"
import {
	createEntrySchema,
	updateEntrySchema,
	deleteEntrySchema,
	getEntrySchema,
	getEntriesSchema,
} from "@/schemas/entries"

const validEntry = {
	date: "2025-01-15T10:30:00Z",
	description: "Compra supermercado",
	creditAccountId: 1,
	debitAccountId: 2,
	amount: 5000,
	category: "food",
	subcategory: "groceries",
}

describe("createEntrySchema", () => {
	it("accepts valid entry data", () => {
		const result = createEntrySchema.safeParse(validEntry)
		expect(result.success).toBe(true)
	})

	it("accepts entry without subcategory", () => {
		const { subcategory: _, ...entryWithoutSub } = validEntry
		const result = createEntrySchema.safeParse(entryWithoutSub)
		expect(result.success).toBe(true)
	})

	it("rejects amount <= 0", () => {
		const result = createEntrySchema.safeParse({ ...validEntry, amount: 0 })
		expect(result.success).toBe(false)
	})

	it("rejects negative amount", () => {
		const result = createEntrySchema.safeParse({ ...validEntry, amount: -100 })
		expect(result.success).toBe(false)
	})

	it("rejects non-integer amount", () => {
		const result = createEntrySchema.safeParse({ ...validEntry, amount: 10.5 })
		expect(result.success).toBe(false)
	})

	it("rejects invalid date format", () => {
		const result = createEntrySchema.safeParse({ ...validEntry, date: "15/01/2025" })
		expect(result.success).toBe(false)
	})

	it("rejects date-only format without time", () => {
		const result = createEntrySchema.safeParse({ ...validEntry, date: "2025-01-15" })
		expect(result.success).toBe(false)
	})

	it("rejects date without leading zeros", () => {
		const result = createEntrySchema.safeParse({ ...validEntry, date: "2025-1-5" })
		expect(result.success).toBe(false)
	})

	it("rejects datetime without Z suffix", () => {
		const result = createEntrySchema.safeParse({ ...validEntry, date: "2025-01-15T14:30:00" })
		expect(result.success).toBe(false)
	})

	it("rejects datetime with non-zero seconds", () => {
		const result = createEntrySchema.safeParse({ ...validEntry, date: "2025-01-15T14:30:45Z" })
		expect(result.success).toBe(false)
	})

	it("rejects datetime with timezone offset", () => {
		const result = createEntrySchema.safeParse({ ...validEntry, date: "2025-01-15T14:30:00+03:00" })
		expect(result.success).toBe(false)
	})

	it("rejects same credit and debit account", () => {
		const result = createEntrySchema.safeParse({
			...validEntry,
			creditAccountId: 1,
			debitAccountId: 1,
		})
		expect(result.success).toBe(false)
		if (!result.success) {
			const paths = result.error.issues.map((i) => i.path?.join("."))
			expect(paths).toContain("debitAccountId")
		}
	})

	it("rejects invalid category", () => {
		const result = createEntrySchema.safeParse({
			...validEntry,
			category: "nonexistent_category",
		})
		expect(result.success).toBe(false)
	})

	it("rejects subcategory not belonging to category", () => {
		const result = createEntrySchema.safeParse({
			...validEntry,
			category: "food",
			subcategory: "gas",
		})
		expect(result.success).toBe(false)
		if (!result.success) {
			const paths = result.error.issues.map((i) => i.path?.join("."))
			expect(paths).toContain("subcategory")
		}
	})

	it("accepts valid category+subcategory pair", () => {
		const result = createEntrySchema.safeParse({
			...validEntry,
			category: "transport",
			subcategory: "gas",
		})
		expect(result.success).toBe(true)
	})

	it("rejects empty description", () => {
		const result = createEntrySchema.safeParse({ ...validEntry, description: "" })
		expect(result.success).toBe(false)
	})

	it("rejects description over 200 characters", () => {
		const result = createEntrySchema.safeParse({
			...validEntry,
			description: "a".repeat(201),
		})
		expect(result.success).toBe(false)
	})

	it("rejects missing required fields", () => {
		const result = createEntrySchema.safeParse({})
		expect(result.success).toBe(false)
	})

})

describe("getEntriesSchema", () => {
	it("accepts empty filter object", () => {
		const result = getEntriesSchema.safeParse({})
		expect(result.success).toBe(true)
	})

	it("accepts filter with accountId", () => {
		const result = getEntriesSchema.safeParse({ accountId: 1 })
		expect(result.success).toBe(true)
	})

	it("accepts filter with category", () => {
		const result = getEntriesSchema.safeParse({ category: "food" })
		expect(result.success).toBe(true)
	})

	it("accepts filter with type", () => {
		const result = getEntriesSchema.safeParse({ type: "expense" })
		expect(result.success).toBe(true)
	})

	it("accepts combined filters", () => {
		const result = getEntriesSchema.safeParse({
			accountId: 1,
			category: "food",
			type: "expense",
		})
		expect(result.success).toBe(true)
	})

	it("rejects invalid type filter", () => {
		const result = getEntriesSchema.safeParse({ type: "transfer" })
		expect(result.success).toBe(false)
	})

	it("accepts dateFrom in YYYY-MM-DD format", () => {
		const result = getEntriesSchema.safeParse({ dateFrom: "2026-01-01" })
		expect(result.success).toBe(true)
	})

	it("accepts dateTo in YYYY-MM-DD format", () => {
		const result = getEntriesSchema.safeParse({ dateTo: "2026-01-31" })
		expect(result.success).toBe(true)
	})

	it("accepts both dateFrom and dateTo", () => {
		const result = getEntriesSchema.safeParse({
			dateFrom: "2026-01-01",
			dateTo: "2026-01-31",
		})
		expect(result.success).toBe(true)
	})

	it("accepts all filters combined including date range", () => {
		const result = getEntriesSchema.safeParse({
			accountId: 1,
			category: "food",
			type: "expense",
			dateFrom: "2026-01-01",
			dateTo: "2026-01-31",
		})
		expect(result.success).toBe(true)
	})

	it("rejects dateFrom in full ISO format", () => {
		const result = getEntriesSchema.safeParse({ dateFrom: "2026-01-01T00:00:00Z" })
		expect(result.success).toBe(false)
	})

	it("rejects dateTo in slash format", () => {
		const result = getEntriesSchema.safeParse({ dateTo: "01/31/2026" })
		expect(result.success).toBe(false)
	})
})

describe("updateEntrySchema", () => {
	it("accepts valid update data with id", () => {
		const result = updateEntrySchema.safeParse({ ...validEntry, id: 1 })
		expect(result.success).toBe(true)
	})

	it("rejects update without id", () => {
		const result = updateEntrySchema.safeParse(validEntry)
		expect(result.success).toBe(false)
	})

	it("rejects non-positive id", () => {
		const result = updateEntrySchema.safeParse({ ...validEntry, id: 0 })
		expect(result.success).toBe(false)
	})

	it("applies same credit/debit refinement", () => {
		const result = updateEntrySchema.safeParse({
			...validEntry,
			id: 1,
			creditAccountId: 1,
			debitAccountId: 1,
		})
		expect(result.success).toBe(false)
	})

	it("applies subcategory refinement", () => {
		const result = updateEntrySchema.safeParse({
			...validEntry,
			id: 1,
			category: "food",
			subcategory: "gas",
		})
		expect(result.success).toBe(false)
	})
})

describe("deleteEntrySchema", () => {
	it("accepts valid id", () => {
		const result = deleteEntrySchema.safeParse({ id: 1 })
		expect(result.success).toBe(true)
	})

	it("rejects non-positive id", () => {
		const result = deleteEntrySchema.safeParse({ id: 0 })
		expect(result.success).toBe(false)
	})

	it("rejects missing id", () => {
		const result = deleteEntrySchema.safeParse({})
		expect(result.success).toBe(false)
	})
})

describe("getEntrySchema", () => {
	it("accepts valid id", () => {
		const result = getEntrySchema.safeParse({ id: 1 })
		expect(result.success).toBe(true)
	})

	it("rejects non-positive id", () => {
		const result = getEntrySchema.safeParse({ id: -1 })
		expect(result.success).toBe(false)
	})
})
