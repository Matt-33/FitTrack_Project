import { z } from "zod";

export const programmeCreateSchema = z.object({
	title: z.string().min(2),
	level: z.enum(["debutant", "intermediaire", "avance"]).optional(),
	goal: z
		.enum(["force", "endurance", "perte_de_poids", "hypertrophie"])
		.optional(),
	description: z.string().optional().nullable(),
	isPublished: z.boolean().optional(),
	exercises: z
		.array(
			z.object({
				exerciceId: z.number().int().positive(),
				orderIndex: z.number().int().nonnegative().optional(),
				reps: z.string().optional(),
				restSec: z.number().int().nonnegative().optional(),
			})
		)
		.optional(),
});

export const programmeUpdateSchema = programmeCreateSchema.partial();
