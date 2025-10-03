import { db } from "../models/index.js";
const { Sequelize, User, Programme, Exercice, ProgrammeExercice } = db;
const { Op } = Sequelize;

export const listProgrammes = async (req, res) => {
	const page = Math.max(parseInt(req.query.page || "1"), 1);
	const limit = Math.min(Math.max(parseInt(req.query.limit || "10"), 1), 50);
	const offset = (page - 1) * limit;

	const where = {};
	const published =
		typeof req.query.published === "string"
			? req.query.published === "true"
			: true;
	if (published !== undefined) where.isPublished = published;

	if (req.query.q) where.title = { [Op.like]: `%${req.query.q}%` };
	if (req.query.level) where.level = req.query.level;
	if (req.query.goal) where.goal = req.query.goal;

	try {
		const { rows, count } = await Programme.findAndCountAll({
			where,
			include: [
				{
					model: User,
					as: "coach",
					attributes: ["id", "name", "role"],
				},
			],
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
		console.error("listProgrammes:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const getProgramme = async (req, res) => {
	try {
		const programme = await Programme.findByPk(req.params.id, {
			include: [
				{
					model: User,
					as: "coach",
					attributes: ["id", "name", "role"],
				},
				{
					model: Exercice,
					as: "exercices",
					through: { attributes: ["orderIndex", "reps", "restSec"] },
				},
			],
		});
		if (!programme)
			return res.status(404).json({ message: "Programme introuvable." });
		res.json(programme);
	} catch (e) {
		console.error("getProgramme:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const createProgramme = async (req, res) => {
	const {
		title,
		level,
		goal,
		description,
		isPublished,
		exercises = [],
	} = req.body;

	try {
		const programme = await Programme.create({
			title,
			level,
			goal,
			description,
			isPublished: !!isPublished,
			coachId: req.user.id,
		});

		if (Array.isArray(exercises) && exercises.length) {
			const rows = exercises.map((e) => ({
				programmeId: programme.id,
				exerciceId: e.exerciceId,
				orderIndex: e.orderIndex ?? null,
				reps: e.reps ?? null,
				restSec: e.restSec ?? null,
			}));
			await ProgrammeExercice.bulkCreate(rows);
		}

		const full = await Programme.findByPk(programme.id, {
			include: [
				{
					model: Exercice,
					as: "exercices",
					through: { attributes: ["orderIndex", "reps", "restSec"] },
				},
				{ model: User, as: "coach", attributes: ["id", "name"] },
			],
		});
		res.status(201).json(full);
	} catch (e) {
		console.error("createProgramme:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const updateProgramme = async (req, res) => {
	const { title, level, goal, description, isPublished, exercises } =
		req.body;

	try {
		const programme = await Programme.findByPk(req.params.id);
		if (!programme)
			return res.status(404).json({ message: "Programme introuvable." });
		if (programme.coachId !== req.user.id) {
			return res.status(403).json({ message: "Non autorisé." });
		}

		await programme.update({
			title,
			level,
			goal,
			description,
			isPublished,
		});

		if (Array.isArray(exercises)) {
			await ProgrammeExercice.destroy({
				where: { programmeId: programme.id },
			});
			const rows = exercises.map((e) => ({
				programmeId: programme.id,
				exerciceId: e.exerciceId,
				orderIndex: e.orderIndex ?? null,
				reps: e.reps ?? null,
				restSec: e.restSec ?? null,
			}));
			await ProgrammeExercice.bulkCreate(rows);
		}

		const full = await Programme.findByPk(programme.id, {
			include: [
				{
					model: Exercice,
					as: "exercices",
					through: { attributes: ["orderIndex", "reps", "restSec"] },
				},
				{ model: User, as: "coach", attributes: ["id", "name"] },
			],
		});
		res.json(full);
	} catch (e) {
		console.error("updateProgramme:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const deleteProgramme = async (req, res) => {
	try {
		const programme = await Programme.findByPk(req.params.id);
		if (!programme)
			return res.status(404).json({ message: "Programme introuvable." });
		if (programme.coachId !== req.user.id) {
			return res.status(403).json({ message: "Non autorisé." });
		}

		await ProgrammeExercice.destroy({
			where: { programmeId: programme.id },
		});
		await programme.destroy();
		res.json({ message: "Programme supprimé." });
	} catch (e) {
		console.error("deleteProgramme:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};
