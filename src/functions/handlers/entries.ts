import { and, desc, eq, gte, lte, or } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { normalizeSubcategory } from "@/constants/categories";
import type * as schema from "@/db/schema";
import { accounts, entries } from "@/db/schema";
import { inferEntryType, type SpecialRole } from "@/lib/entry-type";
import { NotFoundError } from "@/lib/errors";
import type {
	CreateEntryInput,
	DeleteEntryInput,
	GetEntriesFilter,
	GetEntryInput,
	UpdateEntryInput,
} from "@/schemas/entries";

type Db = DrizzleD1Database<typeof schema>;

export async function handleGetEntries(db: Db, data?: GetEntriesFilter) {
	if (!data) {
		return await db.query.entries.findMany({
			orderBy: [desc(entries.date)],
		});
	}

	const conditions = [];
	if (data.accountId) {
		conditions.push(
			or(
				eq(entries.creditAccountId, data.accountId),
				eq(entries.debitAccountId, data.accountId),
			)!,
		);
	}
	if (data.category) {
		conditions.push(eq(entries.category, data.category));
	}
	if (data.type) {
		conditions.push(eq(entries.type, data.type));
	}
	if (data.dateFrom) {
		conditions.push(gte(entries.date, `${data.dateFrom}T00:00:00Z`));
	}
	if (data.dateTo) {
		conditions.push(lte(entries.date, `${data.dateTo}T23:59:59Z`));
	}

	return await db.query.entries.findMany({
		where: conditions.length > 0 ? and(...conditions) : undefined,
		orderBy: [desc(entries.date)],
	});
}

export async function handleGetEntriesWithAccounts(
	db: Db,
	data?: GetEntriesFilter,
) {
	const allEntries = await handleGetEntries(db, data);
	const allAccounts = await db.query.accounts.findMany();
	const accountMap = new Map(allAccounts.map((a) => [a.id, a.name]));

	return allEntries.map((entry) => ({
		...entry,
		creditAccountName: accountMap.get(entry.creditAccountId) ?? "Unknown",
		debitAccountName: accountMap.get(entry.debitAccountId) ?? "Unknown",
	}));
}

export async function handleGetEntry(db: Db, data: GetEntryInput) {
	const entry = await db.query.entries.findFirst({
		where: eq(entries.id, data.id),
	});
	if (!entry) {
		throw new NotFoundError(`Entry with id ${data.id} not found`);
	}
	return entry;
}

export async function handleCreateEntry(db: Db, data: CreateEntryInput) {
	const creditAccount = await db.query.accounts.findFirst({
		where: eq(accounts.id, data.creditAccountId),
	});
	if (!creditAccount) {
		throw new NotFoundError(
			`Credit account with id ${data.creditAccountId} not found`,
		);
	}

	const debitAccount = await db.query.accounts.findFirst({
		where: eq(accounts.id, data.debitAccountId),
	});
	if (!debitAccount) {
		throw new NotFoundError(
			`Debit account with id ${data.debitAccountId} not found`,
		);
	}

	if (debitAccount.specialRole && creditAccount.specialRole) {
		throw new Error("Cannot create an entry between two special accounts");
	}

	const entryType = inferEntryType(
		{ specialRole: debitAccount.specialRole as SpecialRole },
		{ specialRole: creditAccount.specialRole as SpecialRole },
	);
	const normalizedSubcategory = normalizeSubcategory(
		data.category,
		data.subcategory,
	);

	const result = await db
		.insert(entries)
		.values({
			date: data.date,
			description: data.description,
			creditAccountId: data.creditAccountId,
			debitAccountId: data.debitAccountId,
			amount: data.amount,
			category: data.category,
			subcategory: normalizedSubcategory,
			type: entryType,
		})
		.returning();
	return result[0];
}

export async function handleUpdateEntry(db: Db, data: UpdateEntryInput) {
	const existing = await db.query.entries.findFirst({
		where: eq(entries.id, data.id),
	});
	if (!existing) {
		throw new NotFoundError(`Entry with id ${data.id} not found`);
	}

	const creditAccount = await db.query.accounts.findFirst({
		where: eq(accounts.id, data.creditAccountId),
	});
	if (!creditAccount) {
		throw new NotFoundError(
			`Credit account with id ${data.creditAccountId} not found`,
		);
	}

	const debitAccount = await db.query.accounts.findFirst({
		where: eq(accounts.id, data.debitAccountId),
	});
	if (!debitAccount) {
		throw new NotFoundError(
			`Debit account with id ${data.debitAccountId} not found`,
		);
	}

	if (debitAccount.specialRole && creditAccount.specialRole) {
		throw new Error("Cannot create an entry between two special accounts");
	}

	const entryType = inferEntryType(
		{ specialRole: debitAccount.specialRole as SpecialRole },
		{ specialRole: creditAccount.specialRole as SpecialRole },
	);
	const normalizedSubcategory = normalizeSubcategory(
		data.category,
		data.subcategory,
	);

	const result = await db
		.update(entries)
		.set({
			date: data.date,
			description: data.description,
			creditAccountId: data.creditAccountId,
			debitAccountId: data.debitAccountId,
			amount: data.amount,
			category: data.category,
			subcategory: normalizedSubcategory,
			type: entryType,
		})
		.where(eq(entries.id, data.id))
		.returning();
	return result[0];
}

export async function handleDeleteEntry(db: Db, data: DeleteEntryInput) {
	const existing = await db.query.entries.findFirst({
		where: eq(entries.id, data.id),
	});
	if (!existing) {
		throw new NotFoundError(`Entry with id ${data.id} not found`);
	}

	await db.delete(entries).where(eq(entries.id, data.id));
	return { success: true as const, id: data.id };
}
