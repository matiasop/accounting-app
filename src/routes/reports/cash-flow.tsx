import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { CashFlowSankeyReport } from "@/components/reports/CashFlowSankeyReport";
import { Button } from "@/components/ui/button";
import {
	applyReportDateInputChange,
	applyReportDatePreset,
	normalizeReportDateRange,
	reportDateRangeSearchSchema,
} from "@/lib/reports/date-range";
import { entriesQueryOptions } from "@/queries/entries";

export const Route = createFileRoute("/reports/cash-flow")({
	component: CashFlowSankeyPage,
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

function CashFlowSankeyPage() {
	const navigate = useNavigate();
	const search = Route.useSearch();
	const reportDateRange = normalizeReportDateRange(search);
	const { preset, dateFrom, dateTo } = reportDateRange;

	const { data: entries = [] } = useQuery(
		entriesQueryOptions({ dateFrom, dateTo }),
	);

	function handlePresetChange(value: (typeof reportDateRange)["preset"]) {
		const nextRange = applyReportDatePreset({ dateFrom, dateTo }, value);
		navigate({
			to: "/reports/cash-flow",
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
			to: "/reports/cash-flow",
			search: nextRange,
			replace: true,
		});
	}

	return (
		<div className="min-h-screen bg-background py-8 px-4 sm:px-6">
			<div className="mx-auto max-w-[92rem]">
				<div className="mb-6">
					<Button variant="outline" size="sm" asChild>
						<Link to="/reports" search={reportDateRange}>
							<ArrowLeft />
							Back to Reports
						</Link>
					</Button>
				</div>

				<CashFlowSankeyReport
					entries={entries}
					preset={preset}
					dateFrom={dateFrom}
					dateTo={dateTo}
					onPresetChange={handlePresetChange}
					onDateChange={handleDateChange}
				/>
			</div>
		</div>
	);
}
