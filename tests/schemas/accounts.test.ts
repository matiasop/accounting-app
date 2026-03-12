import { describe, it, expect } from "vitest"
import { createAccountSchema, getAccountSchema } from "@/schemas/accounts"

describe("createAccountSchema", () => {
	it("accepts valid asset account", () => {
		const result = createAccountSchema.safeParse({ name: "Efectivo", type: "asset" })
		expect(result.success).toBe(true)
	})

	it("accepts valid liability account", () => {
		const result = createAccountSchema.safeParse({ name: "Tarjeta Visa", type: "liability" })
		expect(result.success).toBe(true)
	})

	it("accepts priority when it is within range", () => {
		expect(
			createAccountSchema.safeParse({
				name: "Caja chica",
				type: "asset",
				priority: 1,
			}).success,
		).toBe(true)

		expect(
			createAccountSchema.safeParse({
				name: "Cuenta principal",
				type: "asset",
				priority: 10,
			}).success,
		).toBe(true)
	})

	it("rejects empty name", () => {
		const result = createAccountSchema.safeParse({ name: "", type: "asset" })
		expect(result.success).toBe(false)
	})

	it("rejects name over 100 characters", () => {
		const result = createAccountSchema.safeParse({ name: "a".repeat(101), type: "asset" })
		expect(result.success).toBe(false)
	})

	it("rejects invalid type", () => {
		const result = createAccountSchema.safeParse({ name: "Test", type: "checking" })
		expect(result.success).toBe(false)
	})

	it("rejects priority below range", () => {
		const result = createAccountSchema.safeParse({
			name: "Test",
			type: "asset",
			priority: 0,
		})
		expect(result.success).toBe(false)
	})

	it("rejects priority above range", () => {
		const result = createAccountSchema.safeParse({
			name: "Test",
			type: "asset",
			priority: 11,
		})
		expect(result.success).toBe(false)
	})

	it("rejects non-integer priority", () => {
		const result = createAccountSchema.safeParse({
			name: "Test",
			type: "asset",
			priority: 5.5,
		})
		expect(result.success).toBe(false)
	})

	it("rejects string priority", () => {
		const result = createAccountSchema.safeParse({
			name: "Test",
			type: "asset",
			priority: "5",
		})
		expect(result.success).toBe(false)
	})

	it("rejects missing name", () => {
		const result = createAccountSchema.safeParse({ type: "asset" })
		expect(result.success).toBe(false)
	})

	it("rejects missing type", () => {
		const result = createAccountSchema.safeParse({ name: "Test" })
		expect(result.success).toBe(false)
	})
})

describe("getAccountSchema", () => {
	it("accepts positive integer id", () => {
		const result = getAccountSchema.safeParse({ id: 1 })
		expect(result.success).toBe(true)
	})

	it("rejects negative id", () => {
		const result = getAccountSchema.safeParse({ id: -1 })
		expect(result.success).toBe(false)
	})

	it("rejects zero", () => {
		const result = getAccountSchema.safeParse({ id: 0 })
		expect(result.success).toBe(false)
	})

	it("rejects non-integer", () => {
		const result = getAccountSchema.safeParse({ id: 1.5 })
		expect(result.success).toBe(false)
	})

	it("rejects string id", () => {
		const result = getAccountSchema.safeParse({ id: "1" })
		expect(result.success).toBe(false)
	})
})
