import { db } from "../models/index.js";
import { z } from "zod";

const logSchema = z.object({
	programmeId: z.number().int().positive().optional(),
	exerciceId: z.number().int().positive().optional(),
	exerciceId: z.number().int().positive().optional(),
	notes: z.string().optional().nullable(),
	weightUsed: z.string().optional().nullable(),
	durationMin: z.number().int().nonnegative().optional(),
	performedAt: z.string().datetime().optional(),
});

export const logWorkout = async (req, res) => {
	const parse = logSchema.safeParse(req.body);
	if (!parse.success) {
		return res
			.status(400)
			.json({ message: "Payload invalide", issues: parse.error.issues });
	}

	try {
		const data = {
			userId: req.user.id,
			programmeId: parse.data.programmeId ?? null,
			exerciceId: parse.data.exerciceId ?? parse.data.exerciceId ?? null,
			notes: parse.data.notes ?? null,
			weightUsed: parse.data.weightUsed ?? null,
			durationMin: parse.data.durationMin ?? null,
			performedAt: parse.data.performedAt ?? undefined,
		};

		const row = await db.WorkoutHistory.create(data);
		res.status(201).json(row);
	} catch (e) {
		console.error("logWorkout:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const myHistory = async (req, res) => {
	const page = Math.max(parseInt(req.query.page || "1"), 1);
	const limit = Math.min(Math.max(parseInt(req.query.limit || "10"), 1), 50);
	const offset = (page - 1) * limit;

	try {
		const { rows, count } = await db.WorkoutHistory.findAndCountAll({
			where: { userId: req.user.id },
			include: [
				{ model: db.Programme, attributes: ["id", "title"] },
				{ model: db.Exercice, attributes: ["id", "name"] },
			],
			order: [["performedAt", "DESC"]],
			limit,
			offset,
		});
		res.json({
			data: rows,
			pagination: {
				page,
				limit,
				total: count,
				pages: Math.ceil(count / limit),
			},
		});
	} catch (e) {
		console.error("myHistory:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};
