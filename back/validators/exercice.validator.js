import { z } from "zod";

export const exerciceCreateSchema = z.object({
	name: z.string().min(2),
	muscleGroup: z.string().optional().nullable(),
	equipment: z.string().optional().nullable(),
});

export const exerciceUpdateSchema = exerciceCreateSchema.partial();
