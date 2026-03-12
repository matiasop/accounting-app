type PrioritizedItem = {
	priority: number;
};

function sortByPriorityDesc<T extends PrioritizedItem>(
	items: readonly T[],
): T[] {
	return items
		.map((item, index) => ({ item, index }))
		.sort((a, b) => b.item.priority - a.item.priority || a.index - b.index)
		.map(({ item }) => item);
}

export const CATEGORY_CATALOG = [
	{
		value: "food",
		priority: 9,
		subcategories: [
			{ value: "groceries", priority: 8 },
			{ value: "restaurant", priority: 7 },
			{ value: "snacks", priority: 6 },
			{ value: "bars_going_out", priority: 5 },
			{ value: "alcohol", priority: 4 },
			{ value: "drinks", priority: 3 },
			{ value: "delivery", priority: 1 },
		],
	},
	{
		value: "transport",
		priority: 3,
		subcategories: [
			{ value: "transit_card", priority: 9 },
			{ value: "gas", priority: 9 },
			{ value: "parking", priority: 7 },
			{ value: "bicycle", priority: 6 },
			{ value: "taxi", priority: 5 },
			{ value: "tolls", priority: 4 },
			{ value: "car_maintenance", priority: 3 },
			{ value: "car_payment", priority: 2 },
			{ value: "car_insurance", priority: 1 },
			{ value: "car_registration", priority: 1 },
		],
	},
	{
		value: "housing",
		priority: 5,
		subcategories: [
			{ value: "rent", priority: 9 },
			{ value: "common_expenses", priority: 5 },
			{ value: "home_maintenance", priority: 5 },
			{ value: "decoration", priority: 5 },
			{ value: "furniture", priority: 5 },
			{ value: "kitchen_items", priority: 5 },
			{ value: "bathroom_items", priority: 5 },
			{ value: "bedroom_items", priority: 5 },
		],
	},
	{
		value: "utilities",
		priority: 5,
		subcategories: [
			{ value: "electricity", priority: 5 },
			{ value: "water", priority: 5 },
			{ value: "gas", priority: 5 },
			{ value: "internet", priority: 5 },
			{ value: "cellphone", priority: 5 },
			{ value: "adjustment", priority: 5 },
			{ value: "taxes", priority: 1 },
		],
	},
	{
		value: "wellness",
		priority: 5,
		subcategories: [
			{ value: "dentist", priority: 5 },
			{ value: "doctor", priority: 5 },
			{ value: "therapy", priority: 5 },
			{ value: "medication", priority: 5 },
			{ value: "beauty_products", priority: 5 },
			{ value: "hygiene", priority: 5 },
			{ value: "exercise", priority: 5 },
			{ value: "supplements", priority: 5 },
		],
	},
	{
		value: "clothing",
		priority: 5,
		subcategories: [
			{ value: "t_shirts", priority: 5 },
			{ value: "pants", priority: 5 },
			{ value: "jackets", priority: 5 },
			{ value: "shoes", priority: 5 },
			{ value: "underwear", priority: 5 },
			{ value: "other_clothing", priority: 5 },
		],
	},
	{
		value: "entertainment",
		priority: 6,
		subcategories: [
			{ value: "books", priority: 5 },
			{ value: "movies", priority: 5 },
			{ value: "subscriptions", priority: 5 },
			{ value: "cinema_theater", priority: 5 },
			{ value: "events", priority: 5 },
			{ value: "video_games", priority: 5 },
			{ value: "games", priority: 5 },
			{ value: "vacation", priority: 5 },
			{ value: "gifts", priority: 5 },
			{ value: "dates", priority: 5 },
			{ value: "paragliding", priority: 5 },
			{ value: "photography", priority: 5 },
		],
	},
	{
		value: "exercise",
		priority: 1,
		subcategories: [
			{ value: "gym", priority: 5 },
			{ value: "equipment", priority: 5 },
		],
	},
	{
		value: "income",
		priority: 7,
		subcategories: [
			{ value: "salary", priority: 5 },
			{ value: "gift_income", priority: 5 },
			{ value: "refund", priority: 5 },
		],
	},
	{
		value: "movement",
		priority: 5,
		subcategories: [{ value: "movement", priority: 5 }],
	},
] as const;

type CategoryDefinition = (typeof CATEGORY_CATALOG)[number];

export type Category = CategoryDefinition["value"];
export type AnySubcategory =
	CategoryDefinition["subcategories"][number]["value"];

type CategorySubcategoryMap = {
	[C in CategoryDefinition as C["value"]]: C["subcategories"][number]["value"];
};

export type Subcategory<C extends Category> = CategorySubcategoryMap[C];

export const CATEGORIES = Object.fromEntries(
	CATEGORY_CATALOG.map((category) => [
		category.value,
		category.subcategories.map((subcategory) => subcategory.value),
	]),
) as {
	[C in Category]: readonly Subcategory<C>[];
};

export const ALL_CATEGORIES = CATEGORY_CATALOG.map(
	(category) => category.value,
) as Category[];

export const ORDERED_CATEGORIES = sortByPriorityDesc(CATEGORY_CATALOG).map(
	(category) => category.value,
) as Category[];

const CATEGORY_LOOKUP = Object.fromEntries(
	CATEGORY_CATALOG.map((category) => [category.value, category]),
) as Record<Category, CategoryDefinition>;

export function getOrderedSubcategories<C extends Category>(
	category: C,
): Subcategory<C>[];
export function getOrderedSubcategories(category: string): string[];
export function getOrderedSubcategories(category: string) {
	if (!(category in CATEGORY_LOOKUP)) return [];

	return sortByPriorityDesc(
		CATEGORY_LOOKUP[category as Category].subcategories,
	).map((subcategory) => subcategory.value);
}

export function isValidSubcategory(
	category: string,
	subcategory: string,
): boolean {
	if (!(category in CATEGORIES)) return false;

	return (CATEGORIES[category as Category] as readonly string[]).includes(
		subcategory,
	);
}
