import { queryOptions } from "@tanstack/react-query"
import {
	getAccounts,
	getAccount,
	getAccountBalance,
	getAllAccountsWithBalances,
} from "@/functions/accounts"

export const accountsQueryOptions = () =>
	queryOptions({
		queryKey: ["accounts"],
		queryFn: () => getAccounts(),
	})

export const accountQueryOptions = (id: number) =>
	queryOptions({
		queryKey: ["accounts", id],
		queryFn: () => getAccount({ data: { id } }),
	})

export const accountBalanceQueryOptions = (id: number) =>
	queryOptions({
		queryKey: ["accounts", id, "balance"],
		queryFn: () => getAccountBalance({ data: { id } }),
	})

export const allAccountsWithBalancesQueryOptions = () =>
	queryOptions({
		queryKey: ["accounts", "withBalances"],
		queryFn: () => getAllAccountsWithBalances(),
	})
