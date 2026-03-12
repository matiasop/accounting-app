import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as ShadcnSelect from "@/components/ui/select";
import { createAccount } from "@/functions/accounts";
import { allAccountsWithBalancesQueryOptions } from "@/queries/accounts";

export const Route = createFileRoute("/accounts/")({
	component: AccountsList,
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(allAccountsWithBalancesQueryOptions()),
});

type AccountWithBalance = Awaited<
	ReturnType<typeof allAccountsWithBalancesQueryOptions>["queryFn"]
>[number];

function AccountsTable({ accounts }: { accounts: AccountWithBalance[] }) {
	if (accounts.length === 0) {
		return (
			<p className="px-4 py-8 text-center text-muted-foreground">
				No accounts found.
			</p>
		);
	}

	return (
		<table className="w-full text-sm">
			<thead className="border-b-2 border-black bg-primary/20">
				<tr>
					<th className="px-4 py-3 text-left font-bold text-foreground uppercase text-xs tracking-wide">
						Name
					</th>
					<th className="px-4 py-3 text-center font-bold text-foreground uppercase text-xs tracking-wide">
						Priority
					</th>
					<th className="px-4 py-3 text-right font-bold text-foreground uppercase text-xs tracking-wide">
						Balance
					</th>
				</tr>
			</thead>
			<tbody className="divide-y divide-black/20">
				{accounts.map((account) => (
					<tr
						key={account.id}
						className="hover:bg-primary/10 transition-colors"
					>
						<td className="px-4 py-3 text-foreground font-medium">
							{account.name}
							{account.specialRole && (
								<span className="ml-2 text-xs text-muted-foreground italic">
									(system)
								</span>
							)}
						</td>
						<td className="px-4 py-3 text-center font-bold text-foreground tabular-nums">
							{account.priority}
						</td>
						<td className="px-4 py-3 text-right text-foreground tabular-nums">
							{account.balance.toLocaleString()}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}

const ACCOUNT_TYPES = [
	{ label: "Asset", value: "asset" },
	{ label: "Liability", value: "liability" },
];

const SPECIAL_ROLE_OPTIONS = [
	{ label: "None", value: "none" },
	{ label: "Income", value: "income" },
	{ label: "Expenses", value: "expenses" },
];

const PRIORITY_OPTIONS = Array.from({ length: 10 }, (_, index) => {
	const value = String(10 - index);
	return { label: value, value };
});

function CreateAccountDialog({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const queryClient = useQueryClient();
	const [name, setName] = useState("");
	const [type, setType] = useState<string>("asset");
	const [priority, setPriority] = useState<string>("5");
	const [specialRole, setSpecialRole] = useState<string>("none");

	const mutation = useMutation({
		mutationFn: (data: {
			name: string;
			type: "asset" | "liability";
			priority: number;
			specialRole?: "income" | "expenses" | null;
		}) => createAccount({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["accounts"] });
			setName("");
			setType("asset");
			setPriority("5");
			setSpecialRole("none");
			onClose();
		},
	});

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
			<div className="rounded-sm border-[3px] border-black bg-white p-6 shadow-brutal-lg max-w-md w-full mx-4">
				<h3 className="text-lg font-extrabold text-foreground uppercase">
					New Account
				</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					Create a new asset or liability account.
				</p>

				<div className="mt-4 space-y-4">
					<div className="space-y-1.5">
						<Label>Name</Label>
						<Input
							placeholder="e.g. Cash, Visa Card"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>

					<div className="space-y-1.5">
						<Label>Type</Label>
						<ShadcnSelect.Select value={type} onValueChange={(v) => setType(v)}>
							<ShadcnSelect.SelectTrigger className="w-full">
								<ShadcnSelect.SelectValue placeholder="Select type" />
							</ShadcnSelect.SelectTrigger>
							<ShadcnSelect.SelectContent>
								{ACCOUNT_TYPES.map((t) => (
									<ShadcnSelect.SelectItem key={t.value} value={t.value}>
										{t.label}
									</ShadcnSelect.SelectItem>
								))}
							</ShadcnSelect.SelectContent>
						</ShadcnSelect.Select>
					</div>

					<div className="space-y-1.5">
						<Label>Priority</Label>
						<ShadcnSelect.Select
							value={priority}
							onValueChange={(value) => setPriority(value)}
						>
							<ShadcnSelect.SelectTrigger className="w-full">
								<ShadcnSelect.SelectValue placeholder="Select priority" />
							</ShadcnSelect.SelectTrigger>
							<ShadcnSelect.SelectContent>
								{PRIORITY_OPTIONS.map((option) => (
									<ShadcnSelect.SelectItem
										key={option.value}
										value={option.value}
									>
										{option.label}
									</ShadcnSelect.SelectItem>
								))}
							</ShadcnSelect.SelectContent>
						</ShadcnSelect.Select>
						<p className="text-xs text-muted-foreground">
							Higher values appear first in account lists.
						</p>
					</div>

					<div className="space-y-1.5">
						<Label>Special Role</Label>
						<ShadcnSelect.Select
							value={specialRole}
							onValueChange={(v) => setSpecialRole(v)}
						>
							<ShadcnSelect.SelectTrigger className="w-full">
								<ShadcnSelect.SelectValue placeholder="Select role" />
							</ShadcnSelect.SelectTrigger>
							<ShadcnSelect.SelectContent>
								{SPECIAL_ROLE_OPTIONS.map((r) => (
									<ShadcnSelect.SelectItem key={r.value} value={r.value}>
										{r.label}
									</ShadcnSelect.SelectItem>
								))}
							</ShadcnSelect.SelectContent>
						</ShadcnSelect.Select>
						<p className="text-xs text-muted-foreground">
							Mark as Income or Expenses to use as a system account for entry
							type classification.
						</p>
					</div>
				</div>

				{mutation.isError && (
					<p className="mt-2 text-sm text-red-500">{mutation.error.message}</p>
				)}

				<div className="mt-4 flex justify-end gap-2">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						disabled={!name.trim() || mutation.isPending}
						onClick={() =>
							mutation.mutate({
								name: name.trim(),
								type: type as "asset" | "liability",
								priority: Number(priority),
								specialRole:
									specialRole === "none"
										? null
										: (specialRole as "income" | "expenses"),
							})
						}
					>
						{mutation.isPending ? "Creating..." : "Create"}
					</Button>
				</div>
			</div>
		</div>
	);
}

function AccountsList() {
	const { data: accounts = [] } = useQuery(
		allAccountsWithBalancesQueryOptions(),
	);
	const [showCreate, setShowCreate] = useState(false);

	const assets = accounts.filter((a) => a.type === "asset");
	const liabilities = accounts.filter((a) => a.type === "liability");

	return (
		<div className="min-h-screen bg-background py-8 px-4 sm:px-6">
			<div className="mx-auto max-w-4xl">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-extrabold tracking-tight text-foreground uppercase">
							Accounts
						</h1>
						<p className="mt-1 text-sm text-muted-foreground font-medium">
							{accounts.length} accounts total
						</p>
					</div>
					<Button onClick={() => setShowCreate(true)}>New Account</Button>
				</div>

				<div className="space-y-6">
					{/* Assets */}
					<section>
						<h2 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-foreground">
							Assets ({assets.length})
						</h2>
						<div className="rounded-sm border-2 border-black bg-white shadow-brutal overflow-hidden">
							<AccountsTable accounts={assets} />
						</div>
					</section>

					{/* Liabilities */}
					<section>
						<h2 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-foreground">
							Liabilities ({liabilities.length})
						</h2>
						<div className="rounded-sm border-2 border-black bg-secondary/10 shadow-brutal overflow-hidden">
							<AccountsTable accounts={liabilities} />
						</div>
					</section>
				</div>
			</div>

			<CreateAccountDialog
				open={showCreate}
				onClose={() => setShowCreate(false)}
			/>
		</div>
	);
}
