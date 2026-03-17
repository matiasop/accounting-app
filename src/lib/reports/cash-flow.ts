import type { InferSelectModel } from "drizzle-orm";
import type { entries } from "@/db/schema";

type Entry = InferSelectModel<typeof entries>;
type CashFlowSide = "income" | "expense";
type CashFlowLinkKind = CashFlowSide | "balance";
type CashFlowNodeKind = CashFlowSide | "center" | "balance";

interface IndexedAmount {
	amount: number;
	index: number;
}

export interface CashFlowGroup {
	category: string;
	amount: number;
	side: CashFlowSide;
}

export interface CashFlowSummary {
	incomeTotal: number;
	expenseTotal: number;
	net: number;
}

export interface CashFlowSankeyNode {
	id: string;
	kind: CashFlowNodeKind;
	label: string;
	category: string | null;
	amount: number;
}

export interface CashFlowSankeyLink {
	source: string;
	target: string;
	value: number;
	kind: CashFlowLinkKind;
}

export interface CashFlowSankeyData extends CashFlowSummary {
	incomeGroups: CashFlowGroup[];
	expenseGroups: CashFlowGroup[];
	nodes: CashFlowSankeyNode[];
	links: CashFlowSankeyLink[];
}

function sortGroupsByAmountDesc(
	groups: CashFlowGroup[],
	order: Map<string, number>,
) {
	return [...groups].sort((a, b) => {
		if (b.amount !== a.amount) return b.amount - a.amount;
		return (order.get(a.category) ?? 0) - (order.get(b.category) ?? 0);
	});
}

function toGroups(
	items: Map<string, IndexedAmount>,
	side: CashFlowSide,
): CashFlowGroup[] {
	const order = new Map(
		Array.from(items.entries(), ([category, value]) => [category, value.index]),
	);
	return sortGroupsByAmountDesc(
		Array.from(items.entries(), ([category, value]) => ({
			category,
			amount: value.amount,
			side,
		})),
		order,
	);
}

export function buildCashFlowGroups(allEntries: Entry[]) {
	const income = new Map<string, IndexedAmount>();
	const expense = new Map<string, IndexedAmount>();
	let seenIndex = 0;

	for (const entry of allEntries) {
		if (entry.type === "movement") continue;

		const map = entry.type === "income" ? income : expense;
		const current = map.get(entry.category);

		if (current) {
			current.amount += entry.amount;
			continue;
		}

		map.set(entry.category, {
			amount: entry.amount,
			index: seenIndex,
		});
		seenIndex += 1;
	}

	return {
		incomeGroups: toGroups(income, "income"),
		expenseGroups: toGroups(expense, "expense"),
	};
}

export function buildCashFlowSankey(allEntries: Entry[]): CashFlowSankeyData {
	const { incomeGroups, expenseGroups } = buildCashFlowGroups(allEntries);

	const incomeTotal = incomeGroups.reduce(
		(sum, group) => sum + group.amount,
		0,
	);
	const expenseTotal = expenseGroups.reduce(
		(sum, group) => sum + group.amount,
		0,
	);
	const net = incomeTotal - expenseTotal;

	const nodes: CashFlowSankeyNode[] = [
		...incomeGroups.map((group) => ({
			id: `income:${group.category}`,
			kind: "income" as const,
			label: group.category,
			category: group.category,
			amount: group.amount,
		})),
		{
			id: "center:cash-flow",
			kind: "center" as const,
			label: "cash-flow",
			category: null,
			amount: Math.max(incomeTotal, expenseTotal, Math.abs(net)),
		},
		...expenseGroups.map((group) => ({
			id: `expense:${group.category}`,
			kind: "expense" as const,
			label: group.category,
			category: group.category,
			amount: group.amount,
		})),
	];

	const links: CashFlowSankeyLink[] = [
		...incomeGroups.map((group) => ({
			source: `income:${group.category}`,
			target: "center:cash-flow",
			value: group.amount,
			kind: "income" as const,
		})),
		...expenseGroups.map((group) => ({
			source: "center:cash-flow",
			target: `expense:${group.category}`,
			value: group.amount,
			kind: "expense" as const,
		})),
	];

	if (net > 0) {
		nodes.push({
			id: "balance:net-positive",
			kind: "balance",
			label: "net",
			category: null,
			amount: net,
		});
		links.push({
			source: "center:cash-flow",
			target: "balance:net-positive",
			value: net,
			kind: "balance",
		});
	} else if (net < 0) {
		nodes.unshift({
			id: "balance:net-negative",
			kind: "balance",
			label: "net",
			category: null,
			amount: Math.abs(net),
		});
		links.unshift({
			source: "balance:net-negative",
			target: "center:cash-flow",
			value: Math.abs(net),
			kind: "balance",
		});
	}

	return {
		incomeGroups,
		expenseGroups,
		nodes,
		links,
		incomeTotal,
		expenseTotal,
		net,
	};
}
