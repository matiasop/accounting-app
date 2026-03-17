import {
	type SankeyLink,
	type SankeyNode,
	sankey,
	sankeyLinkHorizontal,
} from "d3-sankey";
import { useId, useMemo } from "react";
import {
	buildCashFlowSankey,
	type CashFlowSankeyData,
	type CashFlowSankeyLink,
	type CashFlowSankeyNode,
} from "@/lib/reports/cash-flow";

const CHART_WIDTH = 1360;
const CHART_MIN_HEIGHT = 460;
const CHART_ROW_HEIGHT = 84;
const CHART_MARGIN_TOP = 56;
const CHART_MARGIN_BOTTOM = 56;
const CHART_MARGIN_LEFT = 220;
const CHART_MARGIN_RIGHT = 320;
const NODE_WIDTH = 24;
const NODE_PADDING = 28;
const LABEL_FONT_CLASS = "text-[12px] font-bold";
const VALUE_FONT_CLASS = "text-[10px]";
const CENTER_LABEL_FONT_CLASS =
	"text-[12px] font-extrabold uppercase tracking-wide";

type CashFlowEntries = Parameters<typeof buildCashFlowSankey>[0];

interface CashFlowSankeyReportProps {
	entries: CashFlowEntries;
	dateFrom: string;
	dateTo: string;
	onDateChange: (key: "dateFrom" | "dateTo", value: string) => void;
}

type LayoutNode = CashFlowSankeyNode & {
	hidden?: boolean;
};

type LayoutLink = CashFlowSankeyLink & {
	hidden?: boolean;
};

type PositionedNode = SankeyNode<LayoutNode, LayoutLink>;

function formatAmount(amount: number) {
	return amount.toLocaleString();
}

function formatCategoryLabel(value: string) {
	return value
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function getNodeFill(kind: CashFlowSankeyNode["kind"]) {
	if (kind === "income") return "var(--color-chart-2)";
	if (kind === "expense") return "var(--destructive)";
	if (kind === "balance") return "var(--color-chart-4)";
	return "var(--color-primary)";
}

function getLinkStroke(kind: CashFlowSankeyLink["kind"]) {
	if (kind === "income") return "var(--color-chart-2)";
	if (kind === "expense") return "var(--destructive)";
	return "var(--color-chart-4)";
}

function createLayoutInput(data: CashFlowSankeyData) {
	const nodes: LayoutNode[] = data.nodes.map((node) => ({ ...node }));
	const links: LayoutLink[] = data.links.map((link) => ({ ...link }));

	if (data.incomeGroups.length === 0 && data.expenseGroups.length > 0) {
		nodes.unshift({
			id: "hidden:income-anchor",
			kind: "income",
			category: null,
			amount: 0,
			hidden: true,
		});
		links.unshift({
			source: "hidden:income-anchor",
			target: "center:cash-flow",
			value: 0,
			kind: "income",
			hidden: true,
		});
	}

	if (data.expenseGroups.length === 0 && data.incomeGroups.length > 0) {
		nodes.push({
			id: "hidden:expense-anchor",
			kind: "expense",
			category: null,
			amount: 0,
			hidden: true,
		});
		links.push({
			source: "center:cash-flow",
			target: "hidden:expense-anchor",
			value: 0,
			kind: "expense",
			hidden: true,
		});
	}

	return { nodes, links };
}

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
			<p className="mt-1 text-2xl font-extrabold">{formatAmount(amount)}</p>
		</div>
	);
}

function EmptyState({ message }: { message: string }) {
	return (
		<div className="rounded-sm border-2 border-black bg-white shadow-brutal px-4 py-10 text-center text-muted-foreground text-sm">
			{message}
		</div>
	);
}

function CashFlowDiagram({ data }: { data: CashFlowSankeyData }) {
	const graph = useMemo(() => {
		const graphHeight = Math.max(
			CHART_MIN_HEIGHT,
			Math.max(data.incomeGroups.length, data.expenseGroups.length, 1) *
				CHART_ROW_HEIGHT,
		);

		const generator = sankey<
			{ nodes: LayoutNode[]; links: LayoutLink[] },
			LayoutNode,
			LayoutLink
		>()
			.nodeId((node) => node.id)
			.nodeWidth(NODE_WIDTH)
			.nodePadding(NODE_PADDING)
			.nodeSort((a, b) => {
				if (a.hidden || b.hidden) return Number(a.hidden) - Number(b.hidden);
				if (b.amount !== a.amount) return b.amount - a.amount;
				return (a.category ?? "").localeCompare(b.category ?? "");
			})
			.extent([
				[CHART_MARGIN_LEFT, CHART_MARGIN_TOP],
				[
					CHART_WIDTH - CHART_MARGIN_RIGHT,
					graphHeight - CHART_MARGIN_BOTTOM,
				],
			]);

		return {
			graphHeight,
			positioned: generator(createLayoutInput(data)),
		};
	}, [data]);

	const linkPath = useMemo(() => sankeyLinkHorizontal(), []);
	const visibleNodes = graph.positioned.nodes.filter((node) => !node.hidden);
	const visibleLinks = graph.positioned.links.filter((link) => !link.hidden);

	return (
		<div className="rounded-sm border-2 border-black bg-white shadow-brutal overflow-x-auto">
			<svg
				role="img"
				aria-label="Cash flow Sankey diagram"
				className="block h-auto w-full min-w-[1360px]"
				viewBox={`0 0 ${CHART_WIDTH} ${graph.graphHeight}`}
			>
				<title>Cash flow Sankey diagram</title>
				{visibleLinks.map((link) => {
					const source = link.source as PositionedNode;
					const target = link.target as PositionedNode;
					const path = linkPath(link as SankeyLink<LayoutNode, LayoutLink>);

					return (
						<path
							key={`${source.id}-${target.id}`}
							d={path ?? undefined}
							fill="none"
							stroke={getLinkStroke(link.kind)}
							strokeOpacity={0.35}
							strokeWidth={Math.max(link.width ?? 0, 1)}
						>
							<title>
								{`${source.category ? formatCategoryLabel(source.category) : formatCategoryLabel(source.label)} -> ${target.category ? formatCategoryLabel(target.category) : formatCategoryLabel(target.label)}: ${formatAmount(link.value)}`}
							</title>
						</path>
					);
				})}

				{visibleNodes.map((node) => {
					const nodeWidth = (node.x1 ?? 0) - (node.x0 ?? 0);
					const nodeHeight = Math.max((node.y1 ?? 0) - (node.y0 ?? 0), 1);
					const centerX = ((node.x0 ?? 0) + (node.x1 ?? 0)) / 2;
					const centerY = ((node.y0 ?? 0) + (node.y1 ?? 0)) / 2;

					return (
						<g key={node.id}>
							<rect
								x={node.x0}
								y={node.y0}
								width={nodeWidth}
								height={nodeHeight}
								fill={getNodeFill(node.kind)}
								stroke="black"
								strokeWidth={2}
								rx={3}
							>
								<title>
									{`${node.category ? formatCategoryLabel(node.category) : formatCategoryLabel(node.label)}: ${formatAmount(node.amount)}`}
								</title>
							</rect>

							{node.kind === "income" ? (
								<text
									x={(node.x0 ?? 0) - 12}
									y={centerY}
									textAnchor="end"
									dominantBaseline="middle"
									fill="var(--color-foreground)"
									className={LABEL_FONT_CLASS}
								>
									<tspan x={(node.x0 ?? 0) - 12}>
										{formatCategoryLabel(node.category ?? "")}
									</tspan>
									<tspan
										x={(node.x0 ?? 0) - 12}
										dy="1.2em"
										fill="var(--color-muted-foreground)"
										className={VALUE_FONT_CLASS}
									>
										{formatAmount(node.amount)}
									</tspan>
								</text>
							) : null}

							{node.kind === "expense" ? (
								<text
									x={(node.x1 ?? 0) + 12}
									y={centerY}
									textAnchor="start"
									dominantBaseline="middle"
									fill="var(--color-foreground)"
									className={LABEL_FONT_CLASS}
								>
									<tspan x={(node.x1 ?? 0) + 12}>
										{formatCategoryLabel(node.category ?? "")}
									</tspan>
									<tspan
										x={(node.x1 ?? 0) + 12}
										dy="1.2em"
										fill="var(--color-muted-foreground)"
										className={VALUE_FONT_CLASS}
									>
										{formatAmount(node.amount)}
									</tspan>
								</text>
							) : null}

							{node.kind === "center" ? (
								<text
									x={centerX}
									y={Math.max((node.y0 ?? 0) - 18, 20)}
									textAnchor="middle"
									fill="var(--color-foreground)"
									className={CENTER_LABEL_FONT_CLASS}
								>
									<tspan x={centerX}>Cash Flow</tspan>
									<tspan
										x={centerX}
										dy="1.2em"
										fill="var(--color-muted-foreground)"
										className={VALUE_FONT_CLASS}
									>
										{formatAmount(node.amount)}
									</tspan>
								</text>
							) : null}

							{node.kind === "balance" ? (
								<text
									x={
										(node.sourceLinks?.length ?? 0) > 0
											? (node.x0 ?? 0) - 12
											: (node.x1 ?? 0) + 12
									}
									y={centerY}
									textAnchor={(node.sourceLinks?.length ?? 0) > 0 ? "end" : "start"}
									dominantBaseline="middle"
									fill="var(--color-foreground)"
									className={LABEL_FONT_CLASS}
								>
									<tspan
										x={
											(node.sourceLinks?.length ?? 0) > 0
												? (node.x0 ?? 0) - 12
												: (node.x1 ?? 0) + 12
										}
									>
										Net
									</tspan>
									<tspan
										x={
											(node.sourceLinks?.length ?? 0) > 0
												? (node.x0 ?? 0) - 12
												: (node.x1 ?? 0) + 12
										}
										dy="1.2em"
										fill="var(--color-muted-foreground)"
										className={VALUE_FONT_CLASS}
									>
										{formatAmount(node.amount)}
									</tspan>
								</text>
							) : null}
						</g>
					);
				})}
			</svg>
		</div>
	);
}

export function CashFlowSankeyReport({
	entries,
	dateFrom,
	dateTo,
	onDateChange,
}: CashFlowSankeyReportProps) {
	const inputId = useId();
	const data = useMemo(() => buildCashFlowSankey(entries), [entries]);
	const hasChartData = data.incomeTotal > 0 || data.expenseTotal > 0;
	const dateFromId = `${inputId}-date-from`;
	const dateToId = `${inputId}-date-to`;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-extrabold tracking-tight text-foreground uppercase">
					Cash Flow Sankey
				</h1>
				<p className="mt-1 text-sm font-medium text-muted-foreground">
					Income categories flow into a central cash node and out to expense
					categories. Internal movements are excluded.
				</p>
			</div>

			<div className="flex flex-wrap items-end gap-4">
				<div className="flex flex-col gap-1">
					<label
						htmlFor={dateFromId}
						className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
					>
						From
					</label>
					<input
						id={dateFromId}
						type="date"
						value={dateFrom}
						onChange={(event) => onDateChange("dateFrom", event.target.value)}
						className="h-9 rounded-sm border-2 border-black bg-white px-3 py-1 text-sm shadow-brutal-sm focus-visible:outline-none focus-visible:shadow-brutal"
					/>
				</div>
				<div className="flex flex-col gap-1">
					<label
						htmlFor={dateToId}
						className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
					>
						To
					</label>
					<input
						id={dateToId}
						type="date"
						value={dateTo}
						onChange={(event) => onDateChange("dateTo", event.target.value)}
						className="h-9 rounded-sm border-2 border-black bg-white px-3 py-1 text-sm shadow-brutal-sm focus-visible:outline-none focus-visible:shadow-brutal"
					/>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				<SummaryCard
					label="Income"
					amount={data.incomeTotal}
					colorClass="bg-emerald-100 border-emerald-700 text-emerald-700"
				/>
				<SummaryCard
					label="Expenses"
					amount={data.expenseTotal}
					colorClass="bg-red-100 border-red-700 text-red-700"
				/>
				<SummaryCard
					label="Net"
					amount={data.net}
					colorClass={
						data.net > 0
							? "bg-emerald-50 border-emerald-700 text-emerald-700"
							: data.net < 0
								? "bg-red-50 border-red-700 text-red-700"
								: "bg-white border-black text-foreground"
					}
				/>
			</div>

			<div className="rounded-sm border-2 border-black bg-primary/10 px-4 py-3 text-sm font-medium text-foreground shadow-brutal-sm">
				The net for the selected period is summarized above and also balances the
				diagram so incoming and outgoing flow widths stay aligned.
			</div>

			{hasChartData ? (
				<CashFlowDiagram data={data} />
			) : (
				<EmptyState message="No income or expense entries for this period." />
			)}
		</div>
	);
}
