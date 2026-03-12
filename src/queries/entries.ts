import { queryOptions } from "@tanstack/react-query"
import { getEntries, getEntriesWithAccounts, getEntry } from "@/functions/entries"
import type { GetEntriesFilter } from "@/schemas/entries"

export const entriesQueryOptions = (filters?: GetEntriesFilter) =>
	queryOptions({
		queryKey: ["entries", filters ?? "all"],
		queryFn: () => getEntries({ data: filters }),
	})

export const entriesWithAccountsQueryOptions = (filters?: GetEntriesFilter) =>
	queryOptions({
		queryKey: ["entries", "withAccounts", filters ?? "all"],
		queryFn: () => getEntriesWithAccounts({ data: filters }),
	})

export const entryQueryOptions = (id: number) =>
	queryOptions({
		queryKey: ["entries", id],
		queryFn: () => getEntry({ data: { id } }),
	})
