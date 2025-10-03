import { z } from "zod";

export const historyLogSchema = z.object({
	programmeId: z.number().int().positive().optional(),
	exerciceId: z.number().int().positive().optional(),
	notes: z.string().optional().nullable(),
	weightUsed: z.string().optional().nullable(),
	durationMin: z.number().int().nonnegative().optional(),
	performedAt: z.string().datetime().optional(),
});
