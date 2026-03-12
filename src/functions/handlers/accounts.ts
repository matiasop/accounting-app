import { asc, desc, eq, or } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "@/db/schema";
import { accounts, entries } from "@/db/schema";
import { calculateBalance } from "@/lib/balance";
import { NotFoundError } from "@/lib/errors";
import type { CreateAccountInput, GetAccountInput } from "@/schemas/accounts";

type Db = DrizzleD1Database<typeof schema>;

export async function handleGetAccounts(db: Db) {
	return await db.query.accounts.findMany({
		orderBy: [desc(accounts.priority), asc(accounts.name)],
	});
}

export async function handleGetAccount(db: Db, data: GetAccountInput) {
	const account = await db.query.accounts.findFirst({
		where: eq(accounts.id, data.id),
	});
	if (!account) {
		throw new NotFoundError(`Account with id ${data.id} not found`);
	}
	return account;
}

export async function handleCreateAccount(db: Db, data: CreateAccountInput) {
	const result = await db
		.insert(accounts)
		.values({
			...data,
			priority: data.priority ?? 5,
		})
		.returning();
	return result[0];
}

export async function handleGetAllAccountsWithBalances(db: Db) {
	const allAccounts = await db.query.accounts.findMany({
		orderBy: [desc(accounts.priority), asc(accounts.name)],
	});
	const allEntries = await db.query.entries.findMany();
	return allAccounts.map((account) => ({
		...account,
		balance: calculateBalance(account, allEntries),
	}));
}

export async function handleGetAccountBalance(db: Db, data: GetAccountInput) {
	const account = await db.query.accounts.findFirst({
		where: eq(accounts.id, data.id),
	});
	if (!account) {
		throw new NotFoundError(`Account with id ${data.id} not found`);
	}
	const allEntries = await db.query.entries.findMany({
		where: or(
			eq(entries.creditAccountId, data.id),
			eq(entries.debitAccountId, data.id),
		),
	});
	return {
		account,
		balance: calculateBalance(account, allEntries),
	};
}
