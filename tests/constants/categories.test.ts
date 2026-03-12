import { describe, expect, it } from "vitest"
import {
	CATEGORIES,
	CATEGORY_CATALOG,
	ORDERED_CATEGORIES,
	getOrderedSubcategories,
	isValidSubcategory,
} from "@/constants/categories"

describe("category catalog", () => {
	it("keeps all categories at default priority 5", () => {
		expect(CATEGORY_CATALOG.every((category) => category.priority === 5)).toBe(
			true,
		)
		expect(
			CATEGORY_CATALOG.every((category) =>
				category.subcategories.every((subcategory) => subcategory.priority === 5),
			),
		).toBe(true)
	})

	it("preserves declaration order when priorities are tied", () => {
		expect(ORDERED_CATEGORIES).toEqual(
			CATEGORY_CATALOG.map((category) => category.value),
		)
		expect(getOrderedSubcategories("food")).toEqual(CATEGORIES.food)
	})

	it("returns an empty list for an unknown category", () => {
		expect(getOrderedSubcategories("unknown")).toEqual([])
	})

	it("validates category and subcategory relationships", () => {
		expect(isValidSubcategory("food", "groceries")).toBe(true)
		expect(isValidSubcategory("food", "gas")).toBe(false)
		expect(isValidSubcategory("unknown", "groceries")).toBe(false)
	})
})
