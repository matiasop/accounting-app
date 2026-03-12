import { z } from "zod"
import { ALL_CATEGORIES, isValidSubcategory } from "@/constants/categories"

const entryBaseSchema = z.object({
	date: z
		.string()
		.regex(
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00Z$/,
			"Date must be in ISO 8601 UTC format: YYYY-MM-DDTHH:mm:00Z",
		),
	description: z.string().min(1, "Description is required").max(200),
	creditAccountId: z.number().int().positive(),
	debitAccountId: z.number().int().positive(),
	amount: z.number().int().positive("Amount must be greater than 0"),
	category: z.enum(ALL_CATEGORIES as [string, ...string[]]),
	subcategory: z.string().optional(),
})

function withEntryRefines<T extends typeof entryBaseSchema>(schema: T) {
	return schema
		.refine((data) => data.creditAccountId !== data.debitAccountId, {
			message: "Credit and debit accounts must be different",
			path: ["debitAccountId"],
		})
		.refine(
			(data) => {
				if (!data.subcategory) return true
				return isValidSubcategory(data.category, data.subcategory)
			},
			{
				message: "Subcategory does not belong to the given category",
				path: ["subcategory"],
			},
		)
}

export const createEntrySchema = withEntryRefines(entryBaseSchema)

export const updateEntrySchema = withEntryRefines(
	entryBaseSchema.extend({ id: z.number().int().positive() }),
)

export const deleteEntrySchema = z.object({
	id: z.number().int().positive(),
})

export const getEntrySchema = z.object({
	id: z.number().int().positive(),
})

export const getEntriesSchema = z.object({
	accountId: z.number().int().positive().optional(),
	category: z.string().optional(),
	type: z.enum(["expense", "income", "movement"]).optional(),
	dateFrom: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
		.optional(),
	dateTo: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
		.optional(),
})

export type CreateEntryInput = z.infer<typeof createEntrySchema>
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>
export type DeleteEntryInput = z.infer<typeof deleteEntrySchema>
export type GetEntryInput = z.infer<typeof getEntrySchema>
export type GetEntriesFilter = z.infer<typeof getEntriesSchema>
