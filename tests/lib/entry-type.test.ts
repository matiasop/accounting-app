import { describe, it, expect } from "vitest"
import { inferEntryType } from "@/lib/entry-type"

describe("inferEntryType", () => {
	it("returns income when credit account has income role", () => {
		expect(
			inferEntryType({ specialRole: null }, { specialRole: "income" }),
		).toBe("income")
	})

	it("returns expense when debit account has expenses role", () => {
		expect(
			inferEntryType({ specialRole: "expenses" }, { specialRole: null }),
		).toBe("expense")
	})

	it("returns movement when neither account has a special role", () => {
		expect(
			inferEntryType({ specialRole: null }, { specialRole: null }),
		).toBe("movement")
	})

	it("returns income when credit is income even if debit is expenses", () => {
		expect(
			inferEntryType(
				{ specialRole: "expenses" },
				{ specialRole: "income" },
			),
		).toBe("income")
	})
})
