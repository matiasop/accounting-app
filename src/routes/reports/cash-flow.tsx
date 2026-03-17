import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { CashFlowSankeyReport } from "@/components/reports/CashFlowSankeyReport";
import { Button } from "@/components/ui/button";
import {
	firstDayOfMonth,
	lastDayOfMonth,
	reportDateRangeSearchSchema,
} from "@/lib/reports/date-range";
import { entriesQueryOptions } from "@/queries/entries";

export const Route = createFileRoute("/reports/cash-flow")({
	component: CashFlowSankeyPage,
	validateSearch: (search) => reportDateRangeSearchSchema.parse(search),
	loaderDeps: ({ search }) => ({
		dateFrom: search.dateFrom,
		dateTo: search.dateTo,
	}),
	loader: ({ context, deps }) => {
		const from = deps.dateFrom ?? firstDayOfMonth();
		const to = deps.dateTo ?? lastDayOfMonth();
		return context.queryClient.ensureQueryData(
			entriesQueryOptions({ dateFrom: from, dateTo: to }),
		);
	},
});

function CashFlowSankeyPage() {
	const navigate = useNavigate();
	const search = Route.useSearch();

	const dateFrom = search.dateFrom ?? firstDayOfMonth();
	const dateTo = search.dateTo ?? lastDayOfMonth();

	const { data: entries = [] } = useQuery(
		entriesQueryOptions({ dateFrom, dateTo }),
	);

	function handleDateChange(key: "dateFrom" | "dateTo", value: string) {
		navigate({
			to: "/reports/cash-flow",
			search: (prev) => ({ ...prev, [key]: value || undefined }),
			replace: true,
		});
	}

	return (
		<div className="min-h-screen bg-background py-8 px-4 sm:px-6">
			<div className="mx-auto max-w-[92rem]">
				<div className="mb-6">
					<Button variant="outline" size="sm" asChild>
						<Link to="/reports" search={{ dateFrom, dateTo }}>
							<ArrowLeft />
							Back to Reports
						</Link>
					</Button>
				</div>

				<CashFlowSankeyReport
					entries={entries}
					dateFrom={dateFrom}
					dateTo={dateTo}
					onDateChange={handleDateChange}
				/>
			</div>
		</div>
	);
}
