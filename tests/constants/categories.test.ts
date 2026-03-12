import { describe, expect, it } from "vitest"
import {
	CATEGORIES,
	CATEGORY_CATALOG,
	ORDERED_CATEGORIES,
	getOrderedSubcategories,
	isValidSubcategory,
} from "@/constants/categories"

describe("category catalog", () => {
	it("keeps category priorities within the supported range", () => {
		expect(
			CATEGORY_CATALOG.every(
				(category) => category.priority >= 1 && category.priority <= 10,
			),
		).toBe(true)
		expect(
			CATEGORY_CATALOG.every((category) =>
				category.subcategories.every(
					(subcategory) =>
						subcategory.priority >= 1 && subcategory.priority <= 10,
				),
			),
		).toBe(true)
	})

	it("orders categories and subcategories by descending priority", () => {
		expect(ORDERED_CATEGORIES).toEqual([
			"food",
			"income",
			"entertainment",
			"housing",
			"utilities",
			"wellness",
			"clothing",
			"movement",
			"transport",
			"exercise",
		])
		expect(getOrderedSubcategories("food")).toEqual([
			"groceries",
			"restaurant",
			"snacks",
			"bars_going_out",
			"alcohol",
			"drinks",
			"delivery",
		])
		expect(getOrderedSubcategories("wellness")).toEqual(CATEGORIES.wellness)
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
