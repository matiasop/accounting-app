import { describe, expect, it } from "vitest";
import {
	applyReportDateInputChange,
	applyReportDatePreset,
	detectReportDatePreset,
	getDefaultReportDateRange,
	normalizeReportDateRange,
	reportDateRangeSearchSchema,
	resolveReportDatePreset,
	toYYYYMMDD,
} from "@/lib/reports/date-range";

const NOW = new Date(2026, 2, 30, 15, 45, 0);

describe("report date range helpers", () => {
	it("formats YYYY-MM-DD using local date parts", () => {
		expect(toYYYYMMDD(new Date(2026, 0, 1, 23, 59, 0))).toBe("2026-01-01");
	})

	it("resolves all supported presets", () => {
		expect(resolveReportDatePreset("today", NOW)).toEqual({
			dateFrom: "2026-03-30",
			dateTo: "2026-03-30",
		})
		expect(resolveReportDatePreset("weekToDate", NOW)).toEqual({
			dateFrom: "2026-03-30",
			dateTo: "2026-03-30",
		})
		expect(resolveReportDatePreset("monthToDate", NOW)).toEqual({
			dateFrom: "2026-03-01",
			dateTo: "2026-03-30",
		})
		expect(resolveReportDatePreset("yearToDate", NOW)).toEqual({
			dateFrom: "2026-01-01",
			dateTo: "2026-03-30",
		})
		expect(resolveReportDatePreset("yesterday", NOW)).toEqual({
			dateFrom: "2026-03-29",
			dateTo: "2026-03-29",
		})
		expect(resolveReportDatePreset("lastWeek", NOW)).toEqual({
			dateFrom: "2026-03-23",
			dateTo: "2026-03-29",
		})
		expect(resolveReportDatePreset("lastMonth", NOW)).toEqual({
			dateFrom: "2026-02-01",
			dateTo: "2026-02-28",
		})
		expect(resolveReportDatePreset("lastYear", NOW)).toEqual({
			dateFrom: "2025-01-01",
			dateTo: "2025-12-31",
		})
		expect(resolveReportDatePreset("last7Days", NOW)).toEqual({
			dateFrom: "2026-03-24",
			dateTo: "2026-03-30",
		})
		expect(resolveReportDatePreset("last30Days", NOW)).toEqual({
			dateFrom: "2026-03-01",
			dateTo: "2026-03-30",
		})
		expect(resolveReportDatePreset("last365Days", NOW)).toEqual({
			dateFrom: "2025-03-31",
			dateTo: "2026-03-30",
		})
	})

	it("uses ISO weeks starting on Monday", () => {
		expect(resolveReportDatePreset("weekToDate", new Date(2026, 3, 1, 10, 0, 0))).toEqual({
			dateFrom: "2026-03-30",
			dateTo: "2026-04-01",
		})
	})

	it("detects presets in priority order before rolling windows", () => {
		expect(detectReportDatePreset("2026-03-01", "2026-03-30", NOW)).toBe(
			"monthToDate",
		)
		expect(detectReportDatePreset("2026-03-24", "2026-03-30", NOW)).toBe(
			"last7Days",
		)
	})

	it("falls back to manual when the range does not match a preset", () => {
		expect(detectReportDatePreset("2026-03-10", "2026-03-20", NOW)).toBe(
			"manual",
		)
	})

	it("defaults to month to date when search is empty or incomplete", () => {
		expect(getDefaultReportDateRange(NOW)).toEqual({
			preset: "monthToDate",
			dateFrom: "2026-03-01",
			dateTo: "2026-03-30",
		})
		expect(normalizeReportDateRange({}, NOW)).toEqual({
			preset: "monthToDate",
			dateFrom: "2026-03-01",
			dateTo: "2026-03-30",
		})
		expect(
			normalizeReportDateRange({ preset: "manual", dateFrom: "2026-03-10" }, NOW),
		).toEqual({
			preset: "monthToDate",
			dateFrom: "2026-03-01",
			dateTo: "2026-03-30",
		})
	})

	it("lets explicit dates win over a mismatched preset", () => {
		expect(
			normalizeReportDateRange(
				{
					preset: "yearToDate",
					dateFrom: "2026-03-10",
					dateTo: "2026-03-20",
				},
				NOW,
			),
		).toEqual({
			preset: "manual",
			dateFrom: "2026-03-10",
			dateTo: "2026-03-20",
		})
	})

	it("resolves preset-only searches into concrete dates", () => {
		expect(normalizeReportDateRange({ preset: "lastWeek" }, NOW)).toEqual({
			preset: "lastWeek",
			dateFrom: "2026-03-23",
			dateTo: "2026-03-29",
		})
	})

	it("updates range when selecting a preset", () => {
		expect(
			applyReportDatePreset(
				{ dateFrom: "2026-03-10", dateTo: "2026-03-20" },
				"lastYear",
				NOW,
			),
		).toEqual({
			preset: "lastYear",
			dateFrom: "2025-01-01",
			dateTo: "2025-12-31",
		})
	})

	it("updates range when editing inputs and auto-detects matching presets", () => {
		expect(
			applyReportDateInputChange(
				{ dateFrom: "2026-03-10", dateTo: "2026-03-20" },
				"dateFrom",
				"2026-03-01",
				NOW,
			),
		).toEqual({
			preset: "manual",
			dateFrom: "2026-03-01",
			dateTo: "2026-03-20",
		})

		expect(
			applyReportDateInputChange(
				{ dateFrom: "2026-03-01", dateTo: "2026-03-20" },
				"dateTo",
				"2026-03-30",
				NOW,
			),
		).toEqual({
			preset: "monthToDate",
			dateFrom: "2026-03-01",
			dateTo: "2026-03-30",
		})
	})

	it("accepts valid preset values and sanitizes invalid ones", () => {
		expect(
			reportDateRangeSearchSchema.parse({
				preset: "last365Days",
				dateFrom: "2026-01-01",
				dateTo: "2026-01-31",
			}),
		).toEqual({
			preset: "last365Days",
			dateFrom: "2026-01-01",
			dateTo: "2026-01-31",
		})
		expect(
			reportDateRangeSearchSchema.parse({
				preset: "last2Weeks",
			}),
		).toEqual({
			preset: undefined,
		})
	})
})
