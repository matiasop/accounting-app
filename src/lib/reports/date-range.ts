import { z } from "zod";

export const reportDatePresetValues = [
	"today",
	"weekToDate",
	"monthToDate",
	"yearToDate",
	"yesterday",
	"lastWeek",
	"lastMonth",
	"lastYear",
	"last7Days",
	"last30Days",
	"last365Days",
	"manual",
] as const;

export const reportDatePresetSchema = z.enum(reportDatePresetValues);

export type ReportDatePreset = z.infer<typeof reportDatePresetSchema>;
export type ReportDateRangeKey = "dateFrom" | "dateTo";

export interface ReportDateRange {
	preset: ReportDatePreset;
	dateFrom: string;
	dateTo: string;
}

type ResolvedReportDatePreset = Exclude<ReportDatePreset, "manual">;

const resolvableReportDatePresetValues: ResolvedReportDatePreset[] =
	reportDatePresetValues.filter(
		(value): value is ResolvedReportDatePreset => value !== "manual",
	);

export const reportDateRangeSearchSchema = z.object({
	preset: reportDatePresetSchema.optional().catch(undefined),
	dateFrom: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional()
		.catch(undefined),
	dateTo: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional()
		.catch(undefined),
});

export type ReportDateRangeSearch = z.infer<typeof reportDateRangeSearchSchema>;

export function toYYYYMMDD(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function atLocalMidnight(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function shiftDays(date: Date, days: number): Date {
	const next = atLocalMidnight(date);
	next.setDate(next.getDate() + days);
	return next;
}

function startOfIsoWeek(date: Date): Date {
	const next = atLocalMidnight(date);
	const dayOffset = (next.getDay() + 6) % 7;
	next.setDate(next.getDate() - dayOffset);
	return next;
}

function endOfIsoWeek(date: Date): Date {
	return shiftDays(startOfIsoWeek(date), 6);
}

function startOfMonth(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfYear(date: Date): Date {
	return new Date(date.getFullYear(), 0, 1);
}

function endOfYear(date: Date): Date {
	return new Date(date.getFullYear(), 11, 31);
}

export function resolveReportDatePreset(
	preset: ResolvedReportDatePreset,
	now = new Date(),
): Pick<ReportDateRange, "dateFrom" | "dateTo"> {
	const today = atLocalMidnight(now);

	switch (preset) {
		case "today":
			return {
				dateFrom: toYYYYMMDD(today),
				dateTo: toYYYYMMDD(today),
			};
		case "weekToDate":
			return {
				dateFrom: toYYYYMMDD(startOfIsoWeek(today)),
				dateTo: toYYYYMMDD(today),
			};
		case "monthToDate":
			return {
				dateFrom: toYYYYMMDD(startOfMonth(today)),
				dateTo: toYYYYMMDD(today),
			};
		case "yearToDate":
			return {
				dateFrom: toYYYYMMDD(startOfYear(today)),
				dateTo: toYYYYMMDD(today),
			};
		case "yesterday": {
			const yesterday = shiftDays(today, -1);
			return {
				dateFrom: toYYYYMMDD(yesterday),
				dateTo: toYYYYMMDD(yesterday),
			};
		}
		case "lastWeek": {
			const lastWeekReference = shiftDays(startOfIsoWeek(today), -1);
			return {
				dateFrom: toYYYYMMDD(startOfIsoWeek(lastWeekReference)),
				dateTo: toYYYYMMDD(endOfIsoWeek(lastWeekReference)),
			};
		}
		case "lastMonth": {
			const lastMonthReference = new Date(
				today.getFullYear(),
				today.getMonth() - 1,
				1,
			);
			return {
				dateFrom: toYYYYMMDD(startOfMonth(lastMonthReference)),
				dateTo: toYYYYMMDD(endOfMonth(lastMonthReference)),
			};
		}
		case "lastYear": {
			const lastYearReference = new Date(today.getFullYear() - 1, 0, 1);
			return {
				dateFrom: toYYYYMMDD(startOfYear(lastYearReference)),
				dateTo: toYYYYMMDD(endOfYear(lastYearReference)),
			};
		}
		case "last7Days":
			return {
				dateFrom: toYYYYMMDD(shiftDays(today, -6)),
				dateTo: toYYYYMMDD(today),
			};
		case "last30Days":
			return {
				dateFrom: toYYYYMMDD(shiftDays(today, -29)),
				dateTo: toYYYYMMDD(today),
			};
		case "last365Days":
			return {
				dateFrom: toYYYYMMDD(shiftDays(today, -364)),
				dateTo: toYYYYMMDD(today),
			};
	}
}

export function detectReportDatePreset(
	dateFrom: string,
	dateTo: string,
	now = new Date(),
): ReportDatePreset {
	for (const preset of resolvableReportDatePresetValues) {
		const resolved = resolveReportDatePreset(preset, now);
		if (resolved.dateFrom === dateFrom && resolved.dateTo === dateTo) {
			return preset;
		}
	}

	return "manual";
}

export function getDefaultReportDateRange(now = new Date()): ReportDateRange {
	return {
		preset: "monthToDate",
		...resolveReportDatePreset("monthToDate", now),
	};
}

export function normalizeReportDateRange(
	search: ReportDateRangeSearch,
	now = new Date(),
): ReportDateRange {
	if (search.dateFrom && search.dateTo) {
		return {
			preset: detectReportDatePreset(search.dateFrom, search.dateTo, now),
			dateFrom: search.dateFrom,
			dateTo: search.dateTo,
		};
	}

	if (search.preset && search.preset !== "manual") {
		return {
			preset: search.preset,
			...resolveReportDatePreset(search.preset, now),
		};
	}

	return getDefaultReportDateRange(now);
}

export function applyReportDatePreset(
	currentRange: Pick<ReportDateRange, "dateFrom" | "dateTo">,
	preset: ReportDatePreset,
	now = new Date(),
): ReportDateRange {
	if (preset === "manual") {
		return {
			preset: detectReportDatePreset(
				currentRange.dateFrom,
				currentRange.dateTo,
				now,
			),
			dateFrom: currentRange.dateFrom,
			dateTo: currentRange.dateTo,
		};
	}

	return {
		preset,
		...resolveReportDatePreset(preset, now),
	};
}

export function applyReportDateInputChange(
	currentRange: Pick<ReportDateRange, "dateFrom" | "dateTo">,
	key: ReportDateRangeKey,
	value: string,
	now = new Date(),
): ReportDateRange {
	const nextRange = {
		...currentRange,
		[key]: value,
	};

	return {
		preset: detectReportDatePreset(nextRange.dateFrom, nextRange.dateTo, now),
		dateFrom: nextRange.dateFrom,
		dateTo: nextRange.dateTo,
	};
}
