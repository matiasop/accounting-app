import { z } from "zod";

export function toYYYYMMDD(date: Date): string {
	return date.toISOString().slice(0, 10);
}

export function firstDayOfMonth(): string {
	const d = new Date();
	return toYYYYMMDD(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function lastDayOfMonth(): string {
	const d = new Date();
	return toYYYYMMDD(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export const reportDateRangeSearchSchema = z.object({
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
