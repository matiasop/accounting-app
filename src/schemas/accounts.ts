import { z } from "zod";

export const accountPrioritySchema = z
	.number()
	.int("Priority must be an integer")
	.min(1, "Priority must be at least 1")
	.max(10, "Priority must be at most 10");

export const createAccountSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	type: z.enum(["asset", "liability"]),
	priority: accountPrioritySchema.optional(),
	specialRole: z.enum(["income", "expenses"]).nullable().optional(),
});

export const getAccountSchema = z.object({
	id: z.number().int().positive(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type GetAccountInput = z.infer<typeof getAccountSchema>;
