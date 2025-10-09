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

export const getHistoryItem = async (req, res) => {
	try {
		const id = parseInt(req.params.id, 10);
		if (!Number.isFinite(id))
			return res.status(400).json({ message: "ID invalide" });

		const row = await db.WorkoutHistory.findOne({
			where: { id, userId: req.user.id },
			include: [
				{ model: db.Programme, attributes: ["id", "title"] },
				{ model: db.Exercice, attributes: ["id", "name"] },
			],
		});

		if (!row) return res.status(404).json({ message: "Introuvable" });
		res.json(row);
	} catch (e) {
		console.error("getHistoryItem:", e);
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
