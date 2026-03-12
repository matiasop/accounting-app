export type EntryType = "expense" | "income" | "movement"
export type AccountType = "asset" | "liability"
export type SpecialRole = "income" | "expenses" | null

export interface AccountForEntryType {
	specialRole: SpecialRole
}

export function inferEntryType(
	debitAccount: AccountForEntryType,
	creditAccount: AccountForEntryType,
): EntryType {
	if (creditAccount.specialRole === "income") return "income"
	if (debitAccount.specialRole === "expenses") return "expense"
	return "movement"
}
