import { db } from "../models/index.js";
const Workout = db.Workout;

export const createWorkout = async (req, res) => {
	const { title, description, reps } = req.body;

	if (!title || !reps) {
		return res.status(400).json({ message: "Champs requis manquants." });
	}

	try {
		const workout = await Workout.create({
			title,
			description,
			reps,
			type: "coach", // car seul un coach peut créer ici
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
	try {
		const workouts = await db.Workout.findAll({
			where: { type: "coach" },
			include: {
				model: db.User,
				attributes: ["id", "name", "role"],
			},
			order: [["createdAt", "DESC"]],
		});

		res.json(workouts);
	} catch (error) {
		console.error("❌ Erreur getCoachWorkouts :", error);
		res.status(500).json({ message: "Erreur serveur." });
	}
};
