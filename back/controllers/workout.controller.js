import { db } from "../models/index.js";
import { z } from "zod";

const Workout = db.Workout;

const createWorkoutSchema = z.object({
	title: z.string().min(2, "Titre trop court"),
	description: z.string().optional().nullable(),
	reps: z.string().min(1, "Reps requis"),
});

export const createWorkout = async (req, res) => {
	const parse = createWorkoutSchema.safeParse(req.body);
	if (!parse.success) {
		return res
			.status(400)
			.json({ message: "Payload invalide", issues: parse.error.issues });
	}
	const { title, description, reps } = parse.data;

	try {
		const workout = await Workout.create({
			title,
			description,
			reps,
			type: "coach",
			userId: req.user.id,
		});

		res.status(201).json({
			message: "Séance créée avec succès.",
			workout,
		});
	} catch (error) {
		console.error("❌ Erreur createWorkout :", error);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const getCoachWorkouts = async (req, res) => {
	const page = Math.max(parseInt(req.query.page || "1"), 1);
	const limit = Math.min(Math.max(parseInt(req.query.limit || "10"), 1), 50);
	const offset = (page - 1) * limit;

	try {
		const { rows, count } = await db.Workout.findAndCountAll({
			where: { type: "coach" },
			include: {
				model: db.User,
				attributes: ["id", "name", "role"],
			},
			order: [["createdAt", "DESC"]],
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
	} catch (error) {
		console.error("❌ Erreur getCoachWorkouts :", error);
		res.status(500).json({ message: "Erreur serveur." });
	}
};
