/** @vitest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { ReportDateRangeControls } from "@/components/reports/ReportDateRangeControls";
import type { ReportDateRangeSearch } from "@/lib/reports/date-range";
import {
	applyReportDateInputChange,
	applyReportDatePreset,
	normalizeReportDateRange,
} from "@/lib/reports/date-range";

const NOW = new Date(2026, 2, 30, 15, 45, 0);

HTMLElement.prototype.hasPointerCapture ??= () => false;
HTMLElement.prototype.setPointerCapture ??= () => {};
HTMLElement.prototype.releasePointerCapture ??= () => {};
HTMLElement.prototype.scrollIntoView ??= () => {};

function RangeHarness({ initialSearch }: { initialSearch: ReportDateRangeSearch }) {
	const [search, setSearch] = useState<ReportDateRangeSearch>(initialSearch);
	const range = normalizeReportDateRange(search, NOW);

	return (
		<ReportDateRangeControls
			preset={range.preset}
			dateFrom={range.dateFrom}
			dateTo={range.dateTo}
			onPresetChange={(preset) =>
				setSearch(applyReportDatePreset(range, preset, NOW))
			}
			onDateChange={(key, value) => {
				if (!value) return;
				setSearch(applyReportDateInputChange(range, key, value, NOW));
			}}
		/>
	);
}

function selectPreset(label: string) {
	fireEvent.keyDown(screen.getByRole("combobox", { name: "Date range preset" }), {
		key: "ArrowDown",
	});
	fireEvent.click(screen.getByRole("option", { name: label }));
}

describe("ReportDateRangeControls", () => {
	it("recalculates dates when selecting a preset", () => {
		render(<RangeHarness initialSearch={{ preset: "monthToDate" }} />)

		selectPreset("Last 7 Days")

		expect((screen.getByLabelText("From") as HTMLInputElement).value).toBe(
			"2026-03-24",
		)
		expect((screen.getByLabelText("To") as HTMLInputElement).value).toBe(
			"2026-03-30",
		)
		expect(
			screen.getByRole("combobox", { name: "Date range preset" }).textContent,
		).toContain("Last 7 Days")
	})

	it("switches to manual when edited dates no longer match a preset", () => {
		render(<RangeHarness initialSearch={{ preset: "last7Days" }} />)

		fireEvent.change(screen.getByLabelText("From"), {
			target: { value: "2026-03-22" },
		})

		expect(
			screen.getByRole("combobox", { name: "Date range preset" }).textContent,
		).toContain("Manual")
	})

	it("auto-detects the matching preset after manual edits", () => {
		render(
			<RangeHarness
				initialSearch={{ dateFrom: "2026-03-10", dateTo: "2026-03-20" }}
			/>,
		)

		fireEvent.change(screen.getByLabelText("From"), {
			target: { value: "2026-03-01" },
		})
		fireEvent.change(screen.getByLabelText("To"), {
			target: { value: "2026-03-30" },
		})

		expect(
			screen.getByRole("combobox", { name: "Date range preset" }).textContent,
		).toContain("Month to Date")
	})
})
