import { db } from "../models/index.js";
import { z } from "zod";

const createSchema = z.object({
	name: z.string().min(2),
	targetMuscle: z.string().optional().nullable(),
	mediaUrl: z.string().url().optional().nullable(),
	defaultReps: z.string().optional().nullable(),
});

export const listExercices = async (req, res) => {
	const page = Math.max(parseInt(req.query.page || "1"), 1);
	const limit = Math.min(Math.max(parseInt(req.query.limit || "10"), 1), 50);
	const offset = (page - 1) * limit;

	try {
		const { rows, count } = await db.Exercice.findAndCountAll({
			order: [["name", "ASC"]],
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
		console.error("listExercices:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const getExercice = async (req, res) => {
	try {
		const ex = await db.Exercice.findByPk(req.params.id);
		if (!ex)
			return res.status(404).json({ message: "Exercice introuvable." });
		res.json(ex);
	} catch (e) {
		console.error("getExercice:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const createExercice = async (req, res) => {
	const parse = createSchema.safeParse(req.body);
	if (!parse.success)
		return res
			.status(400)
			.json({ message: "Payload invalide", issues: parse.error.issues });

	try {
		const ex = await db.Exercice.create(parse.data);
		res.status(201).json(ex);
	} catch (e) {
		console.error("createExercise:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const updateExercice = async (req, res) => {
	const parse = createSchema.partial().safeParse(req.body);
	if (!parse.success)
		return res
			.status(400)
			.json({ message: "Payload invalide", issues: parse.error.issues });

	try {
		const ex = await db.Exercice.findByPk(req.params.id);
		if (!ex)
			return res.status(404).json({ message: "Exercice introuvable." });

		await ex.update(parse.data);
		res.json(ex);
	} catch (e) {
		console.error("updateExercise:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const deleteExercice = async (req, res) => {
	try {
		const ex = await db.Exercice.findByPk(req.params.id);
		if (!ex)
			return res.status(404).json({ message: "Exercice introuvable." });

		await ex.destroy();
		res.json({ message: "Exercice supprimé." });
	} catch (e) {
		console.error("deleteExercice:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};
