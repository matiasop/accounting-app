import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ReportDateRangeControls } from "@/components/reports/ReportDateRangeControls";
import { Button } from "@/components/ui/button";
import {
	applyReportDateInputChange,
	applyReportDatePreset,
	normalizeReportDateRange,
	reportDateRangeSearchSchema,
} from "@/lib/reports/date-range";
import { entriesQueryOptions } from "@/queries/entries";

// ── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/reports/")({
	component: ReportsPage,
	validateSearch: (search) => reportDateRangeSearchSchema.parse(search),
	loaderDeps: ({ search }) => ({
		preset: search.preset,
		dateFrom: search.dateFrom,
		dateTo: search.dateTo,
	}),
	loader: ({ context, deps }) => {
		const { dateFrom, dateTo } = normalizeReportDateRange(deps);
		return context.queryClient.ensureQueryData(
			entriesQueryOptions({ dateFrom, dateTo }),
		);
	},
});

// ── Types ────────────────────────────────────────────────────────────────────
type BreakdownMode = "category" | "subcategory";

interface CategoryRow {
	category: string;
	income: number;
	expenses: number;
	net: number;
}

interface SubcategoryGroup {
	category: string;
	rows: {
		subcategory: string;
		income: number;
		expenses: number;
		net: number;
	}[];
}

// ── Main component ───────────────────────────────────────────────────────────
function ReportsPage() {
	const navigate = useNavigate();
	const search = Route.useSearch();
	const reportDateRange = normalizeReportDateRange(search);
	const { preset, dateFrom, dateTo } = reportDateRange;

	const [breakdownMode, setBreakdownMode] = useState<BreakdownMode>("category");

	const { data: entries = [] } = useQuery(
		entriesQueryOptions({ dateFrom, dateTo }),
	);

	// ── Aggregations ───────────────────────────────────────────────────────
	const summary = useMemo(() => {
		let income = 0;
		let expenses = 0;
		let movements = 0;
		for (const e of entries) {
			if (e.type === "income") income += e.amount;
			else if (e.type === "expense") expenses += e.amount;
			else movements += e.amount;
		}
		return { income, expenses, movements };
	}, [entries]);

	const categoryBreakdown = useMemo((): CategoryRow[] => {
		const map = new Map<string, { income: number; expenses: number }>();
		for (const e of entries) {
			if (e.type === "movement") continue;
			const cur = map.get(e.category) ?? { income: 0, expenses: 0 };
			if (e.type === "income") cur.income += e.amount;
			else cur.expenses += e.amount;
			map.set(e.category, cur);
		}
		return Array.from(map.entries())
			.map(([category, { income, expenses }]) => ({
				category,
				income,
				expenses,
				net: income - expenses,
			}))
			.sort((a, b) => b.expenses - a.expenses);
	}, [entries]);

	const subcategoryBreakdown = useMemo((): SubcategoryGroup[] => {
		type SubMap = Map<string, { income: number; expenses: number }>;
		const catMap = new Map<string, SubMap>();

		for (const e of entries) {
			if (e.type === "movement") continue;
			const sub = e.subcategory ?? "(none)";
			let subMap = catMap.get(e.category);
			if (!subMap) {
				subMap = new Map();
				catMap.set(e.category, subMap);
			}
			const cur = subMap.get(sub) ?? { income: 0, expenses: 0 };
			if (e.type === "income") cur.income += e.amount;
			else cur.expenses += e.amount;
			subMap.set(sub, cur);
		}

		// Sort categories by total expenses descending
		return Array.from(catMap.entries())
			.map(([category, subMap]) => ({
				category,
				rows: Array.from(subMap.entries())
					.map(([subcategory, { income, expenses }]) => ({
						subcategory,
						income,
						expenses,
						net: income - expenses,
					}))
					.sort((a, b) => b.expenses - a.expenses),
			}))
			.sort(
				(a, b) =>
					b.rows.reduce((s, r) => s + r.expenses, 0) -
					a.rows.reduce((s, r) => s + r.expenses, 0),
			);
	}, [entries]);

	// ── Handlers ───────────────────────────────────────────────────────────
	function handlePresetChange(value: (typeof reportDateRange)["preset"]) {
		const nextRange = applyReportDatePreset({ dateFrom, dateTo }, value);
		navigate({
			to: "/reports",
			search: nextRange,
			replace: true,
		});
	}

	function handleDateChange(key: "dateFrom" | "dateTo", value: string) {
		if (!value) return;
		const nextRange = applyReportDateInputChange(
			{ dateFrom, dateTo },
			key,
			value,
		);
		navigate({
			to: "/reports",
			search: nextRange,
			replace: true,
		});
	}

	// ── Render ─────────────────────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-background py-8 px-4 sm:px-6">
			<div className="mx-auto max-w-5xl">
				{/* Page title */}
				<div className="mb-6 flex flex-wrap items-start justify-between gap-4">
					<h1 className="text-2xl font-extrabold tracking-tight text-foreground uppercase">
						Reports
					</h1>
					<Button variant="outline" asChild>
						<Link to="/reports/cash-flow" search={reportDateRange}>
							Cash Flow Sankey
						</Link>
					</Button>
				</div>

				{/* Date range controls */}
				<div className="mb-6">
					<ReportDateRangeControls
						preset={preset}
						dateFrom={dateFrom}
						dateTo={dateTo}
						onPresetChange={handlePresetChange}
						onDateChange={handleDateChange}
					/>
				</div>

				{/* Summary cards */}
				<div className="mb-8 grid gap-4 sm:grid-cols-3">
					<SummaryCard
						label="Income"
						amount={summary.income}
						colorClass="bg-emerald-100 border-emerald-700 text-emerald-700"
					/>
					<SummaryCard
						label="Expenses"
						amount={summary.expenses}
						colorClass="bg-red-100 border-red-700 text-red-700"
					/>
					<SummaryCard
						label="Movements"
						amount={summary.movements}
						colorClass="bg-blue-100 border-blue-700 text-blue-700"
					/>
				</div>

				{/* Breakdown toggle */}
				<div className="mb-4">
					<div className="inline-flex rounded-sm border-2 border-black shadow-brutal-sm overflow-hidden">
						<button
							type="button"
							onClick={() => setBreakdownMode("category")}
							className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wide transition-colors ${
								breakdownMode === "category"
									? "bg-primary"
									: "bg-white hover:bg-primary/20"
							}`}
						>
							By Category
						</button>
						<button
							type="button"
							onClick={() => setBreakdownMode("subcategory")}
							className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wide border-l-2 border-black transition-colors ${
								breakdownMode === "subcategory"
									? "bg-primary"
									: "bg-white hover:bg-primary/20"
							}`}
						>
							By Subcategory
						</button>
					</div>
				</div>

				{/* Breakdown table */}
				{breakdownMode === "category" ? (
					<CategoryTable rows={categoryBreakdown} />
				) : (
					<SubcategoryTable groups={subcategoryBreakdown} />
				)}
			</div>
		</div>
	);
}

// ── Summary card ─────────────────────────────────────────────────────────────
function SummaryCard({
	label,
	amount,
	colorClass,
}: {
	label: string;
	amount: number;
	colorClass: string;
}) {
	return (
		<div
			className={`rounded-sm border-2 border-black p-4 shadow-brutal ${colorClass}`}
		>
			<p className="text-xs font-extrabold uppercase tracking-widest opacity-70">
				{label}
			</p>
			<p className="mt-1 text-2xl font-extrabold">{amount.toLocaleString()}</p>
		</div>
	);
}

// ── Category table ────────────────────────────────────────────────────────────
function CategoryTable({ rows }: { rows: CategoryRow[] }) {
	if (rows.length === 0) {
		return (
			<EmptyState message="No income or expense entries for this period." />
		);
	}

	return (
		<div className="rounded-sm border-2 border-black bg-white shadow-brutal overflow-x-auto">
			<table className="w-full text-sm">
				<thead className="border-b-2 border-black bg-primary/20">
					<tr>
						{["Category", "Income", "Expenses", "Net"].map((h) => (
							<th
								key={h}
								className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-foreground"
							>
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="divide-y divide-black/20">
					{rows.map((row) => (
						<tr
							key={row.category}
							className="hover:bg-primary/10 transition-colors"
						>
							<td className="px-4 py-3 font-medium capitalize">
								{row.category}
							</td>
							<td className="px-4 py-3 text-emerald-700 font-medium">
								{row.income > 0 ? row.income.toLocaleString() : "-"}
							</td>
							<td className="px-4 py-3 text-red-700 font-medium">
								{row.expenses > 0 ? row.expenses.toLocaleString() : "-"}
							</td>
							<td
								className={`px-4 py-3 font-bold ${
									row.net > 0
										? "text-emerald-700"
										: row.net < 0
											? "text-red-700"
											: "text-foreground"
								}`}
							>
								{row.net.toLocaleString()}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

// ── Subcategory table ─────────────────────────────────────────────────────────
function SubcategoryTable({ groups }: { groups: SubcategoryGroup[] }) {
	if (groups.length === 0) {
		return (
			<EmptyState message="No income or expense entries for this period." />
		);
	}

	return (
		<div className="rounded-sm border-2 border-black bg-white shadow-brutal overflow-x-auto">
			<table className="w-full text-sm">
				<thead className="border-b-2 border-black bg-primary/20">
					<tr>
						{["Subcategory", "Income", "Expenses", "Net"].map((h) => (
							<th
								key={h}
								className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-foreground"
							>
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{groups.map((group) => (
						<>
							{/* Category header row */}
							<tr
								key={`cat-${group.category}`}
								className="bg-primary/20 border-y-2 border-black"
							>
								<td
									colSpan={4}
									className="px-4 py-2 text-xs font-extrabold uppercase tracking-wide"
								>
									{group.category}
								</td>
							</tr>
							{/* Subcategory rows */}
							{group.rows.map((row) => (
								<tr
									key={`${group.category}-${row.subcategory}`}
									className="hover:bg-primary/10 transition-colors border-b border-black/20"
								>
									<td className="px-4 py-3 pl-8 capitalize">
										{row.subcategory}
									</td>
									<td className="px-4 py-3 text-emerald-700 font-medium">
										{row.income > 0 ? row.income.toLocaleString() : "-"}
									</td>
									<td className="px-4 py-3 text-red-700 font-medium">
										{row.expenses > 0 ? row.expenses.toLocaleString() : "-"}
									</td>
									<td
										className={`px-4 py-3 font-bold ${
											row.net > 0
												? "text-emerald-700"
												: row.net < 0
													? "text-red-700"
													: "text-foreground"
										}`}
									>
										{row.net.toLocaleString()}
									</td>
								</tr>
							))}
						</>
					))}
				</tbody>
			</table>
		</div>
	);
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
	return (
		<div className="rounded-sm border-2 border-black bg-white shadow-brutal px-4 py-10 text-center text-muted-foreground text-sm">
			{message}
		</div>
	);
}
