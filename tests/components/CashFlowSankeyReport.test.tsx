/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { InferSelectModel } from "drizzle-orm"
import type { entries } from "@/db/schema"
import { CashFlowSankeyReport } from "@/components/reports/CashFlowSankeyReport"

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

describe("CashFlowSankeyReport", () => {
	it("shows an empty state when the range only contains movements", () => {
		render(
			<CashFlowSankeyReport
				entries={[
					mockEntry({
						id: 1,
						amount: 5000,
						category: "movement",
						type: "movement",
					}),
				]}
				dateFrom="2025-01-01"
				dateTo="2025-01-31"
				onDateChange={vi.fn()}
			/>,
		)

		expect(
			screen.getByText("No income or expense entries for this period."),
		).toBeTruthy()
	})

	it("renders date inputs, totals, and the chart when data exists", () => {
		render(
			<CashFlowSankeyReport
				entries={[
					mockEntry({ id: 1, amount: 8000, category: "income", type: "income" }),
					mockEntry({ id: 2, amount: 3000, category: "food", type: "expense" }),
				]}
				dateFrom="2025-01-01"
				dateTo="2025-01-31"
				onDateChange={vi.fn()}
			/>,
		)

		expect((screen.getByLabelText("From") as HTMLInputElement).value).toBe(
			"2025-01-01",
		)
		expect((screen.getByLabelText("To") as HTMLInputElement).value).toBe(
			"2025-01-31",
		)
		expect(screen.getAllByText("Income").length).toBeGreaterThan(0)
		expect(screen.getAllByText("Expenses").length).toBeGreaterThan(0)
		expect(screen.getAllByText("Net").length).toBeGreaterThan(0)
		expect(
			screen.getAllByText(Intl.NumberFormat().format(8000)).length,
		).toBeGreaterThan(0)
		expect(
			screen.getAllByText(Intl.NumberFormat().format(3000)).length,
		).toBeGreaterThan(0)
		expect(screen.getByRole("img", { name: "Cash flow Sankey diagram" })).toBeTruthy()
	})
})
