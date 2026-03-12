import { createServerFn } from "@tanstack/react-start"
import { getDb } from "@/db/index"
import {
	createEntrySchema,
	deleteEntrySchema,
	getEntriesSchema,
	getEntrySchema,
	updateEntrySchema,
} from "@/schemas/entries"
import {
	handleGetEntries,
	handleGetEntriesWithAccounts,
	handleGetEntry,
	handleCreateEntry,
	handleUpdateEntry,
	handleDeleteEntry,
} from "./handlers/entries"
import { authMiddleware } from "@/middleware/auth"

export const getEntries = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((data: unknown) => {
		if (data === undefined || data === null) return undefined
		return getEntriesSchema.parse(data)
	})
	.handler(async ({ data }) => handleGetEntries(getDb(), data))

export const getEntriesWithAccounts = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((data: unknown) => {
		if (data === undefined || data === null) return undefined
		return getEntriesSchema.parse(data)
	})
	.handler(async ({ data }) => handleGetEntriesWithAccounts(getDb(), data))

export const getEntry = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((data: unknown) => getEntrySchema.parse(data))
	.handler(async ({ data }) => handleGetEntry(getDb(), data))

export const createEntry = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((data: unknown) => createEntrySchema.parse(data))
	.handler(async ({ data }) => handleCreateEntry(getDb(), data))

export const updateEntry = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((data: unknown) => updateEntrySchema.parse(data))
	.handler(async ({ data }) => handleUpdateEntry(getDb(), data))

export const deleteEntry = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((data: unknown) => deleteEntrySchema.parse(data))
	.handler(async ({ data }) => handleDeleteEntry(getDb(), data))
