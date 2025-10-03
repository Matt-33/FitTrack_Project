import { db } from "../models/index.js";
const { WorkoutHistory, Programme, Exercice } = db;

export const logWorkout = async (req, res) => {
	const {
		programmeId = null,
		exerciceId = null,
		notes = null,
		weightUsed = null,
		durationMin = null,
		performedAt,
	} = req.body;

	try {
		const data = {
			userId: req.user.id,
			programmeId,
			exerciceId,
			notes,
			weightUsed,
			durationMin,
			performedAt: performedAt || undefined,
		};
		const row = await WorkoutHistory.create(data);
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
		const { rows, count } = await WorkoutHistory.findAndCountAll({
			where: { userId: req.user.id },
			include: [
				{ model: Programme, attributes: ["id", "title"] },
				{ model: Exercice, attributes: ["id", "name"] },
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
