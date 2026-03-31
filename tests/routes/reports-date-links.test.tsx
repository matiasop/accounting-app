/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import type { ComponentType, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockNavigate = vi.fn();
let mockSearch = {
	preset: "lastWeek",
	dateFrom: "2026-03-23",
	dateTo: "2026-03-29",
};

vi.mock("@tanstack/react-query", () => ({
	useQuery: () => ({ data: [] }),
}));

vi.mock("@/queries/entries", () => ({
	entriesQueryOptions: vi.fn(() => ({
		queryKey: ["entries"],
		queryFn: async () => [],
	})),
}));

vi.mock("@/components/reports/CashFlowSankeyReport", () => ({
	CashFlowSankeyReport: () => <div>Mock Sankey</div>,
}));

vi.mock("@tanstack/react-router", () => ({
	createFileRoute:
		() =>
		(options: Record<string, unknown>) => ({
			useSearch: () => mockSearch,
			options,
		}),
	Link: ({
		to,
		search,
		children,
	}: {
		to: string;
		search?: Record<string, unknown> | ((prev: Record<string, unknown>) => unknown);
		children: ReactNode;
	}) => {
		const resolvedSearch =
			typeof search === "function" ? search(mockSearch) : search;

		return (
			<a href={to} data-search={JSON.stringify(resolvedSearch)}>
				{children}
			</a>
		);
	},
	useNavigate: () => mockNavigate,
}));

import { Route as CashFlowRoute } from "@/routes/reports/cash-flow";
import { Route as ReportsRoute } from "@/routes/reports/index";

describe("report route links", () => {
	beforeEach(() => {
		mockNavigate.mockReset();
		mockSearch = {
			preset: "lastWeek",
			dateFrom: "2026-03-23",
			dateTo: "2026-03-29",
		};
	})

	it("preserves preset and dates when linking to cash flow", () => {
		const ReportsPage = ReportsRoute.options.component as ComponentType
		render(<ReportsPage />)

		expect(
			screen
				.getByRole("link", { name: "Cash Flow Sankey" })
				.getAttribute("data-search"),
		).toBe(JSON.stringify(mockSearch))
	})

	it("preserves preset and dates when linking back to reports", () => {
		const CashFlowPage = CashFlowRoute.options.component as ComponentType
		render(<CashFlowPage />)

		expect(
			screen
				.getByRole("link", { name: "Back to Reports" })
				.getAttribute("data-search"),
		).toBe(JSON.stringify(mockSearch))
	})
})
