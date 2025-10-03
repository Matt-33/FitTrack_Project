import { db } from "../models/index.js";
const { Sequelize, Exercice } = db;
const { Op } = Sequelize;

export const listExercices = async (req, res) => {
	const page = Math.max(parseInt(req.query.page || "1"), 1);
	const limit = Math.min(Math.max(parseInt(req.query.limit || "20"), 1), 100);
	const offset = (page - 1) * limit;
	const q = (req.query.q || "").trim();

	const where = {};
	if (q) where.name = { [Op.like]: `%${q}%` };

	try {
		const { rows, count } = await Exercice.findAndCountAll({
			where,
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
	} catch (e) {
		console.error("listExercices:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const getExercice = async (req, res) => {
	try {
		const ex = await Exercice.findByPk(req.params.id);
		if (!ex)
			return res.status(404).json({ message: "Exercice introuvable." });
		res.json(ex);
	} catch (e) {
		console.error("getExercice:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const createExercice = async (req, res) => {
	const { name, muscleGroup, equipment } = req.body;
	try {
		const ex = await Exercice.create({ name, muscleGroup, equipment });
		res.status(201).json(ex);
	} catch (e) {
		console.error("createExercice:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const updateExercice = async (req, res) => {
	const { name, muscleGroup, equipment } = req.body;
	try {
		const ex = await Exercice.findByPk(req.params.id);
		if (!ex)
			return res.status(404).json({ message: "Exercice introuvable." });
		await ex.update({ name, muscleGroup, equipment });
		res.json(ex);
	} catch (e) {
		console.error("updateExercice:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const deleteExercice = async (req, res) => {
	try {
		const ex = await Exercice.findByPk(req.params.id);
		if (!ex)
			return res.status(404).json({ message: "Exercice introuvable." });
		await ex.destroy();
		res.json({ message: "Exercice supprimé." });
	} catch (e) {
		console.error("deleteExercice:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};
