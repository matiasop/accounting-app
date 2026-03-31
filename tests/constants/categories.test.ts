import { describe, expect, it } from "vitest"
import {
	CATEGORIES,
	CATEGORY_CATALOG,
	ORDERED_CATEGORIES,
	getDefaultSubcategory,
	getOrderedSubcategories,
	isValidSubcategory,
	normalizeSubcategory,
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
			"vacation",
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
		expect(getOrderedSubcategories("vacation")).toEqual([
			"uncategorized",
			"travel_tickets",
			"lodging",
			"transport",
			"food",
			"activities",
			"shopping",
		])
		expect(getOrderedSubcategories("exercise")).toEqual([
			"gym",
			"climbing",
			"running",
			"classes",
			"equipment",
		])
	})

	it("returns an empty list for an unknown category", () => {
		expect(getOrderedSubcategories("unknown")).toEqual([])
	})

	it("validates category and subcategory relationships", () => {
		expect(isValidSubcategory("food", "groceries")).toBe(true)
		expect(isValidSubcategory("food", "gas")).toBe(false)
		expect(isValidSubcategory("vacation", "travel_tickets")).toBe(true)
		expect(isValidSubcategory("exercise", "climbing")).toBe(true)
		expect(isValidSubcategory("entertainment", "vacation")).toBe(false)
		expect(isValidSubcategory("unknown", "groceries")).toBe(false)
	})

	it("provides defaults and normalizes vacation subcategories", () => {
		expect(getDefaultSubcategory("vacation")).toBe("uncategorized")
		expect(getDefaultSubcategory("food")).toBe("")
		expect(normalizeSubcategory("vacation", undefined)).toBe("uncategorized")
		expect(normalizeSubcategory("vacation", "")).toBe("uncategorized")
		expect(normalizeSubcategory("food", "")).toBeNull()
		expect(normalizeSubcategory("food", "groceries")).toBe("groceries")
	})
})
