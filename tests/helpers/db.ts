import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import * as schema from "@/db/schema"

export function createTestDb() {
	const sqlite = new Database(":memory:")
	const db = drizzle(sqlite, { schema })

	sqlite.exec(`
		CREATE TABLE accounts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			type TEXT NOT NULL CHECK(type IN ('asset', 'liability')),
			priority INTEGER NOT NULL DEFAULT 5 CHECK(priority BETWEEN 1 AND 10),
			special_role TEXT CHECK(special_role IN ('income', 'expenses') OR special_role IS NULL),
			created_at INTEGER DEFAULT (unixepoch())
		)
	`)

	sqlite.exec(`
		CREATE TABLE entries (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			date TEXT NOT NULL,
			description TEXT NOT NULL,
			credit_account_id INTEGER NOT NULL REFERENCES accounts(id),
			debit_account_id INTEGER NOT NULL REFERENCES accounts(id),
			amount INTEGER NOT NULL,
			category TEXT NOT NULL,
			subcategory TEXT,
			type TEXT NOT NULL CHECK(type IN ('expense', 'income', 'movement')),
			created_at INTEGER DEFAULT (unixepoch())
		)
	`)

	return { db, sqlite }
}

export type TestDb = ReturnType<typeof createTestDb>
