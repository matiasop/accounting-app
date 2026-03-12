import { createServerFn } from "@tanstack/react-start"
import { getDb } from "@/db/index"
import { createAccountSchema, getAccountSchema } from "@/schemas/accounts"
import {
	handleGetAccounts,
	handleGetAccount,
	handleCreateAccount,
	handleGetAccountBalance,
	handleGetAllAccountsWithBalances,
} from "./handlers/accounts"
import { authMiddleware } from "@/middleware/auth"

export const getAccounts = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async () => handleGetAccounts(getDb()))

export const getAccount = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((data: unknown) => getAccountSchema.parse(data))
	.handler(async ({ data }) => handleGetAccount(getDb(), data))

export const createAccount = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((data: unknown) => createAccountSchema.parse(data))
	.handler(async ({ data }) => handleCreateAccount(getDb(), data))

export const getAllAccountsWithBalances = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async () => handleGetAllAccountsWithBalances(getDb()))

export const getAccountBalance = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((data: unknown) => getAccountSchema.parse(data))
	.handler(async ({ data }) => handleGetAccountBalance(getDb(), data))
