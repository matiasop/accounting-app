import { describe, expect, it } from "vitest"
import type { InferSelectModel } from "drizzle-orm"
import type { entries } from "@/db/schema"
import {
	buildCashFlowGroups,
	buildCashFlowSankey,
} from "@/lib/reports/cash-flow"

type Entry = InferSelectModel<typeof entries>

function mockEntry(overrides: Partial<Entry> = {}): Entry {
	return {
		id: 1,
		date: "2025-01-01T00:00:00Z",
		description: "Test entry",
		creditAccountId: 1,
		debitAccountId: 2,
		amount: 100,
		category: "income",
		subcategory: null,
		type: "income",
		createdAt: null,
		...overrides,
	}
}

describe("cash flow report helpers", () => {
	it("groups income and expense entries by category and excludes movements", () => {
		const { incomeGroups, expenseGroups } = buildCashFlowGroups([
			mockEntry({ id: 1, amount: 8000, category: "income", type: "income" }),
			mockEntry({ id: 2, amount: 2000, category: "income", type: "income" }),
			mockEntry({ id: 3, amount: 3500, category: "food", type: "expense" }),
			mockEntry({ id: 4, amount: 1500, category: "transport", type: "expense" }),
			mockEntry({ id: 5, amount: 9999, category: "movement", type: "movement" }),
		])

		expect(incomeGroups).toEqual([
			{ category: "income", amount: 10000, side: "income" },
		])
		expect(expenseGroups).toEqual([
			{ category: "food", amount: 3500, side: "expense" },
			{ category: "transport", amount: 1500, side: "expense" },
		])
	})

	it("sorts each side by amount descending", () => {
		const { incomeGroups, expenseGroups } = buildCashFlowGroups([
			mockEntry({ id: 1, amount: 1200, category: "gift", type: "income" }),
			mockEntry({ id: 2, amount: 5000, category: "income", type: "income" }),
			mockEntry({ id: 3, amount: 800, category: "housing", type: "expense" }),
			mockEntry({ id: 4, amount: 2000, category: "food", type: "expense" }),
		])

		expect(incomeGroups.map((group) => group.category)).toEqual([
			"income",
			"gift",
		])
		expect(expenseGroups.map((group) => group.category)).toEqual([
			"food",
			"housing",
		])
	})

	it("returns totals, net, nodes, and links for the sankey graph", () => {
		const result = buildCashFlowSankey([
			mockEntry({ id: 1, amount: 9000, category: "income", type: "income" }),
			mockEntry({ id: 2, amount: 2500, category: "food", type: "expense" }),
			mockEntry({ id: 3, amount: 1000, category: "transport", type: "expense" }),
		])

		expect(result.incomeTotal).toBe(9000)
		expect(result.expenseTotal).toBe(3500)
		expect(result.net).toBe(5500)
		expect(result.nodes.map((node) => node.id)).toEqual([
			"income:income",
			"center:cash-flow",
			"expense:food",
			"expense:transport",
			"balance:net-positive",
		])
		expect(result.links).toEqual([
			{
				source: "income:income",
				target: "center:cash-flow",
				value: 9000,
				kind: "income",
			},
			{
				source: "center:cash-flow",
				target: "expense:food",
				value: 2500,
				kind: "expense",
			},
			{
				source: "center:cash-flow",
				target: "expense:transport",
				value: 1000,
				kind: "expense",
			},
			{
				source: "center:cash-flow",
				target: "balance:net-positive",
				value: 5500,
				kind: "balance",
			},
		])
	})

	it("handles empty input", () => {
		const result = buildCashFlowSankey([])

		expect(result.incomeGroups).toEqual([])
		expect(result.expenseGroups).toEqual([])
		expect(result.incomeTotal).toBe(0)
		expect(result.expenseTotal).toBe(0)
		expect(result.net).toBe(0)
		expect(result.links).toEqual([])
	})

	it("handles periods with only incomes", () => {
		const result = buildCashFlowSankey([
			mockEntry({ id: 1, amount: 3000, category: "income", type: "income" }),
		])

		expect(result.incomeGroups).toEqual([
			{ category: "income", amount: 3000, side: "income" },
		])
		expect(result.expenseGroups).toEqual([])
		expect(result.net).toBe(3000)
		expect(result.links).toEqual([
			{
				source: "income:income",
				target: "center:cash-flow",
				value: 3000,
				kind: "income",
			},
			{
				source: "center:cash-flow",
				target: "balance:net-positive",
				value: 3000,
				kind: "balance",
			},
		])
	})

	it("handles periods with only expenses", () => {
		const result = buildCashFlowSankey([
			mockEntry({ id: 1, amount: 2200, category: "food", type: "expense" }),
		])

		expect(result.incomeGroups).toEqual([])
		expect(result.expenseGroups).toEqual([
			{ category: "food", amount: 2200, side: "expense" },
		])
		expect(result.net).toBe(-2200)
		expect(result.links).toEqual([
			{
				source: "balance:net-negative",
				target: "center:cash-flow",
				value: 2200,
				kind: "balance",
			},
			{
				source: "center:cash-flow",
				target: "expense:food",
				value: 2200,
				kind: "expense",
			},
		])
	})
})
