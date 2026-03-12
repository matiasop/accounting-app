import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable("accounts", {
	id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	type: text({ enum: ["asset", "liability"] }).notNull(),
	priority: integer({ mode: "number" }).notNull().default(5),
	specialRole: text("special_role", { enum: ["income", "expenses"] }),
	createdAt: integer("created_at", { mode: "timestamp" }).default(
		sql`(unixepoch())`,
	),
});

export const entries = sqliteTable("entries", {
	id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
	/** ISO 8601 UTC datetime: "YYYY-MM-DDTHH:mm:00Z" */
	date: text().notNull(),
	description: text().notNull(),
	creditAccountId: integer("credit_account_id", { mode: "number" })
		.notNull()
		.references(() => accounts.id),
	debitAccountId: integer("debit_account_id", { mode: "number" })
		.notNull()
		.references(() => accounts.id),
	amount: integer({ mode: "number" }).notNull(),
	category: text().notNull(),
	subcategory: text(),
	type: text({ enum: ["expense", "income", "movement"] }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).default(
		sql`(unixepoch())`,
	),
});
