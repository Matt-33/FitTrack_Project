import { z } from "zod";

export const enrollmentCreateSchema = z.object({
	programmeId: z.number().int().positive(),
});
