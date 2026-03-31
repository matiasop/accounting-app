import { useForm, useStore } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useId, useMemo, useRef } from "react";
import { z } from "zod";

import { EntryTypeBadge } from "@/components/EntryTypeBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as ShadcnSelect from "@/components/ui/select";
import {
	getDefaultSubcategory,
	getOrderedSubcategories,
	normalizeSubcategory,
	ORDERED_CATEGORIES,
} from "@/constants/categories";
import { createEntry, updateEntry } from "@/functions/entries";
import type { EntryType } from "@/lib/entry-type";
import { accountsQueryOptions } from "@/queries/accounts";
import { entryQueryOptions } from "@/queries/entries";

const searchSchema = z.object({
	editId: z.coerce.number().int().positive().optional().catch(undefined),
});

export const Route = createFileRoute("/entries/create")({
	component: CreateEntry,
	validateSearch: (search) => searchSchema.parse(search),
	loaderDeps: ({ search }) => ({ editId: search?.editId }),
	loader: async ({ context, deps }) => {
		const accounts = await context.queryClient.ensureQueryData(
			accountsQueryOptions(),
		);
		if (deps.editId) {
			const entry = await context.queryClient.ensureQueryData(
				entryQueryOptions(deps.editId),
			);
			return { entry, accounts };
		}
		return { entry: null, accounts };
	},
});

const utcDate = () => new Date().toISOString().split("T")[0];
const utcTime = () => new Date().toISOString().slice(11, 16);

function combineDatetime(date: string, time: string): string {
	return `${date}T${time}:00Z`;
}

const ENTRY_TYPE_OPTIONS: { label: string; value: EntryType }[] = [
	{ label: "Expense", value: "expense" },
	{ label: "Income", value: "income" },
	{ label: "Movement", value: "movement" },
];

function CreateEntry() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { editId } = Route.useSearch();
	const { entry: editEntry, accounts: loaderAccounts } = Route.useLoaderData();
	const { data: accounts = loaderAccounts } = useQuery(accountsQueryOptions());
	const dateId = useId();
	const timeId = useId();
	const descriptionId = useId();
	const amountId = useId();
	const isEditing = !!editId;

	const incomeAccount = accounts.find((a) => a.specialRole === "income");
	const expensesAccount = accounts.find((a) => a.specialRole === "expenses");
	const regularAccounts = accounts.filter((a) => !a.specialRole);

	// For edit mode: derive entryType and the user-facing account from existing entry
	const editDefaults = useMemo(() => {
		if (!editEntry) return null;
		const entryType = editEntry.type as EntryType;
		if (entryType === "income") {
			return {
				entryType,
				accountId: String(editEntry.debitAccountId),
				debitAccountId: "",
				creditAccountId: "",
			};
		}
		if (entryType === "expense") {
			return {
				entryType,
				accountId: String(editEntry.creditAccountId),
				debitAccountId: "",
				creditAccountId: "",
			};
		}
		return {
			entryType,
			accountId: "",
			debitAccountId: String(editEntry.debitAccountId),
			creditAccountId: String(editEntry.creditAccountId),
		};
	}, [editEntry]);

	const createEntryMutation = useMutation({
		mutationFn: (data: {
			date: string;
			description: string;
			creditAccountId: number;
			debitAccountId: number;
			amount: number;
			category: string;
			subcategory?: string;
		}) => createEntry({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["entries"] });
			queryClient.invalidateQueries({ queryKey: ["accounts"] });
			navigate({ to: "/entries" });
		},
	});

	const updateEntryMutation = useMutation({
		mutationFn: (data: {
			id: number;
			date: string;
			description: string;
			creditAccountId: number;
			debitAccountId: number;
			amount: number;
			category: string;
			subcategory?: string;
		}) => updateEntry({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["entries"] });
			queryClient.invalidateQueries({ queryKey: ["accounts"] });
			navigate({ to: "/entries" });
		},
	});

	const defaultValues =
		editEntry && editDefaults
			? {
					date: editEntry.date.split("T")[0],
					time: editEntry.date.slice(11, 16),
					description: editEntry.description,
					entryType: editDefaults.entryType,
					accountId: editDefaults.accountId,
					debitAccountId: editDefaults.debitAccountId,
					creditAccountId: editDefaults.creditAccountId,
					amount: String(editEntry.amount),
					category: editEntry.category,
					subcategory:
						normalizeSubcategory(editEntry.category, editEntry.subcategory) ??
						"",
				}
			: {
					date: utcDate(),
					time: utcTime(),
					description: "",
					entryType: "expense" as EntryType,
					accountId:
						regularAccounts.length > 0 ? String(regularAccounts[0].id) : "",
					debitAccountId:
						regularAccounts.length > 0 ? String(regularAccounts[0].id) : "",
					creditAccountId:
						regularAccounts.length > 1 ? String(regularAccounts[1].id) : "",
					amount: "",
					category: "",
					subcategory: getDefaultSubcategory(""),
				};

	const form = useForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			let debitAccountId: number;
			let creditAccountId: number;

			if (value.entryType === "income") {
				if (!incomeAccount) throw new Error("Income account not found");
				debitAccountId = Number(value.accountId);
				creditAccountId = incomeAccount.id;
			} else if (value.entryType === "expense") {
				if (!expensesAccount) throw new Error("Expenses account not found");
				debitAccountId = expensesAccount.id;
				creditAccountId = Number(value.accountId);
			} else {
				debitAccountId = Number(value.debitAccountId);
				creditAccountId = Number(value.creditAccountId);
			}

			const payload = {
				date: combineDatetime(value.date, value.time),
				description: value.description,
				creditAccountId,
				debitAccountId,
				amount: Number(value.amount),
				category: value.category,
				subcategory:
					normalizeSubcategory(value.category, value.subcategory) ?? undefined,
			};
			try {
				if (isEditing) {
					await updateEntryMutation.mutateAsync({
						...payload,
						id: editId,
					});
				} else {
					await createEntryMutation.mutateAsync(payload);
				}
			} catch {
				// Error is handled by mutation state
			}
		},
	});

	const selectedCategory = useStore(form.store, (s) => s.values.category);
	const subcategoryOptions = selectedCategory
		? getOrderedSubcategories(selectedCategory)
		: [];

	const entryType = useStore(
		form.store,
		(s) => s.values.entryType,
	) as EntryType;

	const regularAccountOptions = regularAccounts.map((a) => ({
		label: `${a.name} (${a.type})`,
		value: String(a.id),
	}));

	const activeMutation = isEditing ? updateEntryMutation : createEntryMutation;

	const formRef = useRef<HTMLFormElement>(null);

	const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
		if (e.key !== "Enter") return;
		const target = e.target as HTMLElement;
		if (
			target instanceof HTMLButtonElement ||
			target instanceof HTMLTextAreaElement
		)
			return;
		if (target.getAttribute("role") === "combobox") return;
		e.preventDefault();
		formRef.current
			?.querySelector<HTMLButtonElement>('button[type="submit"]')
			?.click();
	};

	const isMovement = entryType === "movement";

	return (
		<div className="min-h-screen bg-background py-8 px-4 sm:px-6">
			<div className="mx-auto max-w-2xl">
				<div className="mb-6">
					<Link
						to="/entries"
						className="text-sm text-muted-foreground hover:text-foreground font-bold uppercase tracking-wide"
					>
						&larr; Back to Entries
					</Link>
					<h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground uppercase">
						{isEditing ? "Edit Entry" : "New Entry"}
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						{isEditing
							? "Modify this accounting entry"
							: "Record a new accounting entry"}
					</p>
				</div>

				<form
					ref={formRef}
					onKeyDown={handleFormKeyDown}
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<div className="space-y-6">
						{/* Transaction Details */}
						<section className="rounded-sm border-2 border-black bg-white p-6 shadow-brutal">
							<h2 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-foreground">
								Transaction Details
							</h2>
							<div className="space-y-1.5">
								<Label htmlFor={dateId}>Date & Time (UTC)</Label>
								<div className="flex gap-2">
									<form.Field name="date">
										{(field) => (
											<Input
												id={dateId}
												type="date"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className="flex-1"
											/>
										)}
									</form.Field>
									<form.Field name="time">
										{(field) => (
											<Input
												id={timeId}
												type="time"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className="w-32"
											/>
										)}
									</form.Field>
								</div>
							</div>

							<div className="mt-4">
								<form.Field name="description">
									{(field) => (
										<div className="space-y-1.5">
											<Label htmlFor={descriptionId}>Description</Label>
											<Input
												id={descriptionId}
												placeholder="e.g. Grocery shopping"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
										</div>
									)}
								</form.Field>
							</div>
						</section>

						{/* Entry Type & Accounts */}
						<section className="rounded-sm border-2 border-black bg-secondary/10 p-6 shadow-brutal">
							<h2 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-foreground">
								Type & Accounts
							</h2>

							{/* Entry Type Selector */}
							<div className="space-y-1.5">
								<Label>Entry Type</Label>
								<form.Field name="entryType">
									{(field) => (
										<div className="flex gap-2">
											{ENTRY_TYPE_OPTIONS.map((opt) => (
												<button
													key={opt.value}
													type="button"
													onClick={() => field.handleChange(opt.value)}
													className={`flex-1 rounded-sm border-2 border-black px-3 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
														field.state.value === opt.value
															? opt.value === "expense"
																? "bg-red-100 text-red-700"
																: opt.value === "income"
																	? "bg-emerald-100 text-emerald-700"
																	: "bg-blue-100 text-blue-700"
															: "bg-white text-muted-foreground hover:bg-gray-50"
													}`}
												>
													{opt.label}
												</button>
											))}
										</div>
									)}
								</form.Field>
							</div>

							{/* Account Selectors */}
							{regularAccounts.length === 0 ? (
								<p className="mt-4 text-sm text-muted-foreground">
									No accounts found. Create accounts first.
								</p>
							) : isMovement ? (
								<div className="mt-4 grid gap-4 sm:grid-cols-2">
									<form.Field name="debitAccountId">
										{(field) => (
											<div className="space-y-1.5">
												<Label>Debit Account</Label>
												<ShadcnSelect.Select
													value={field.state.value}
													onValueChange={(v) => field.handleChange(v)}
												>
													<ShadcnSelect.SelectTrigger className="w-full">
														<ShadcnSelect.SelectValue placeholder="Select account" />
													</ShadcnSelect.SelectTrigger>
													<ShadcnSelect.SelectContent>
														{regularAccountOptions.map((a) => (
															<ShadcnSelect.SelectItem
																key={a.value}
																value={a.value}
															>
																{a.label}
															</ShadcnSelect.SelectItem>
														))}
													</ShadcnSelect.SelectContent>
												</ShadcnSelect.Select>
											</div>
										)}
									</form.Field>

									<form.Field
										name="creditAccountId"
										validators={{
											onBlur: ({ value, fieldApi }) => {
												const debitId =
													fieldApi.form.getFieldValue("debitAccountId");
												if (value && debitId && value === debitId) {
													return "Credit and debit accounts must be different";
												}
												return undefined;
											},
										}}
									>
										{(field) => (
											<div className="space-y-1.5">
												<Label>Credit Account</Label>
												<ShadcnSelect.Select
													value={field.state.value}
													onValueChange={(v) => {
														field.handleChange(v);
														field.handleBlur();
													}}
												>
													<ShadcnSelect.SelectTrigger className="w-full">
														<ShadcnSelect.SelectValue placeholder="Select account" />
													</ShadcnSelect.SelectTrigger>
													<ShadcnSelect.SelectContent>
														{regularAccountOptions.map((a) => (
															<ShadcnSelect.SelectItem
																key={a.value}
																value={a.value}
															>
																{a.label}
															</ShadcnSelect.SelectItem>
														))}
													</ShadcnSelect.SelectContent>
												</ShadcnSelect.Select>
												{field.state.meta.isTouched &&
													field.state.meta.errors.length > 0 && (
														<p className="text-sm text-destructive font-bold">
															{field.state.meta.errors.join(", ")}
														</p>
													)}
											</div>
										)}
									</form.Field>
								</div>
							) : (
								<div className="mt-4">
									<form.Field name="accountId">
										{(field) => (
											<div className="space-y-1.5">
												<Label>Account</Label>
												<ShadcnSelect.Select
													value={field.state.value}
													onValueChange={(v) => field.handleChange(v)}
												>
													<ShadcnSelect.SelectTrigger className="w-full">
														<ShadcnSelect.SelectValue placeholder="Select account" />
													</ShadcnSelect.SelectTrigger>
													<ShadcnSelect.SelectContent>
														{regularAccountOptions.map((a) => (
															<ShadcnSelect.SelectItem
																key={a.value}
																value={a.value}
															>
																{a.label}
															</ShadcnSelect.SelectItem>
														))}
													</ShadcnSelect.SelectContent>
												</ShadcnSelect.Select>
											</div>
										)}
									</form.Field>
								</div>
							)}

							<div className="mt-3 flex items-center gap-2">
								<span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
									Type:
								</span>
								<EntryTypeBadge type={entryType} />
							</div>
						</section>

						{/* Amount & Classification */}
						<section className="rounded-sm border-2 border-black bg-primary/5 p-6 shadow-brutal">
							<h2 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-foreground">
								Amount & Classification
							</h2>

							<div className="mb-4">
								<form.Field name="amount">
									{(field) => (
										<div className="space-y-1.5">
											<Label htmlFor={amountId}>Amount</Label>
											<Input
												id={amountId}
												type="number"
												min="1"
												step="1"
												placeholder="0"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
										</div>
									)}
								</form.Field>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<form.Field name="category">
									{(field) => (
										<div className="space-y-1.5">
											<Label>Category</Label>
											<ShadcnSelect.Select
												value={field.state.value}
												onValueChange={(v) => {
													field.handleChange(v);
													form.setFieldValue(
														"subcategory",
														getDefaultSubcategory(v),
													);
												}}
											>
												<ShadcnSelect.SelectTrigger className="w-full">
													<ShadcnSelect.SelectValue placeholder="Select category" />
												</ShadcnSelect.SelectTrigger>
												<ShadcnSelect.SelectContent>
													{ORDERED_CATEGORIES.map((c) => (
														<ShadcnSelect.SelectItem key={c} value={c}>
															{c}
														</ShadcnSelect.SelectItem>
													))}
												</ShadcnSelect.SelectContent>
											</ShadcnSelect.Select>
										</div>
									)}
								</form.Field>

								<form.Field name="subcategory">
									{(field) => (
										<div className="space-y-1.5">
											<Label>Subcategory</Label>
											<ShadcnSelect.Select
												value={field.state.value}
												onValueChange={(v) => field.handleChange(v)}
												disabled={subcategoryOptions.length === 0}
											>
												<ShadcnSelect.SelectTrigger className="w-full">
													<ShadcnSelect.SelectValue placeholder="Select subcategory" />
												</ShadcnSelect.SelectTrigger>
												<ShadcnSelect.SelectContent>
													{subcategoryOptions.map((s) => (
														<ShadcnSelect.SelectItem key={s} value={s}>
															{s}
														</ShadcnSelect.SelectItem>
													))}
												</ShadcnSelect.SelectContent>
											</ShadcnSelect.Select>
										</div>
									)}
								</form.Field>
							</div>
						</section>

						{/* Submit */}
						<div className="flex items-center justify-between">
							<div>
								{activeMutation.isError && (
									<p className="text-sm text-destructive font-bold">
										{activeMutation.error.message}
									</p>
								)}
							</div>
							<form.Subscribe
								selector={(state) => ({
									values: state.values,
									isSubmitting: state.isSubmitting,
								})}
							>
								{({ values, isSubmitting }) => {
									const hasAccount = isMovement
										? values.debitAccountId && values.creditAccountId
										: values.accountId;
									const allFilled =
										values.date &&
										values.time &&
										values.description &&
										hasAccount &&
										values.amount &&
										values.category;
									return (
										<Button
											type="submit"
											disabled={
												!allFilled || isSubmitting || activeMutation.isPending
											}
										>
											{activeMutation.isPending
												? isEditing
													? "Updating..."
													: "Creating..."
												: isEditing
													? "Update Entry"
													: "Create Entry"}
										</Button>
									);
								}}
							</form.Subscribe>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
