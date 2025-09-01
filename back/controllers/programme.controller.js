import { db } from "../models/index.js";
import { z } from "zod";
import { Op } from "sequelize";

// -------- Zod schemas --------
const exerciseItem = z.object({
	exerciseId: z.number().int().positive().optional(), // EN
	exerciceId: z.number().int().positive().optional(), // FR
	orderIndex: z.number().int().nonnegative().optional(),
	reps: z.string().optional(),
	restSec: z.number().int().nonnegative().optional(),
});

// On accepte exercises (EN) ET exercices (FR)
const baseSchema = {
	title: z.string().min(2),
	level: z.enum(["debutant", "intermediaire", "avance"]).optional(),
	goal: z
		.enum(["force", "endurance", "perte_de_poids", "hypertrophie"])
		.optional(),
	description: z.string().optional().nullable(),
	isPublished: z.boolean().optional(),
	exercises: z.array(exerciseItem).optional(), // EN
	exercices: z.array(exerciseItem).optional(), // FR
};

const createSchema = z.object(baseSchema);
const updateSchema = z.object(baseSchema).partial();

// -------- Controllers --------

export const listProgrammes = async (req, res) => {
	const page = Math.max(parseInt(req.query.page || "1", 10), 1);
	const limit = Math.min(
		Math.max(parseInt(req.query.limit || "10", 10), 1),
		50
	);
	const offset = (page - 1) * limit;

	// Filtres
	const { q = "", level, goal } = req.query;

	const where = { isPublished: true };
	if (level) where.level = level; // "debutant" | "intermediaire" | "avance"
	if (goal) where.goal = goal; // "hypertrophie" | "force" | "endurance" | "perte_de_poids"
	if (q && q.trim().length >= 2) {
		const like = `%${q.trim()}%`;
		where[Op.or] = [
			{ title: { [Op.like]: like } },
			{ description: { [Op.like]: like } },
		];
	}

	try {
		const { rows, count } = await db.Programme.findAndCountAll({
			where,
			include: [
				{
					model: db.User,
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
		const programme = await db.Programme.findByPk(req.params.id, {
			include: [
				{
					model: db.User,
					as: "coach",
					attributes: ["id", "name", "role"],
				},
				{
					model: db.Exercice,
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
	const parsed = createSchema.safeParse(req.body);
	if (!parsed.success) {
		return res
			.status(400)
			.json({ message: "Payload invalide", issues: parsed.error.issues });
	}

	const { title, level, goal, description, isPublished } = parsed.data;
	// Support EN/FR pour la liste
	const exercisesInput = parsed.data.exercises ?? parsed.data.exercices ?? [];

	try {
		const programme = await db.Programme.create({
			title,
			level,
			goal,
			description,
			isPublished: !!isPublished,
			coachId: req.user.id,
		});

		if (Array.isArray(exercisesInput) && exercisesInput.length) {
			const rows = exercisesInput
				.map((e) => ({
					programmeId: programme.id,
					// Support EN/FR pour l'ID d'exercice
					exerciceId: e.exerciseId ?? e.exerciceId,
					orderIndex: e.orderIndex ?? null,
					reps: e.reps ?? null,
					restSec: e.restSec ?? null,
				}))
				.filter((r) => r.exerciceId); // on garde seulement ceux avec un id

			if (rows.length) {
				await db.ProgrammeExercice.bulkCreate(rows);
			}
		}

		const full = await db.Programme.findByPk(programme.id, {
			include: [
				{
					model: db.Exercice,
					as: "exercices",
					through: { attributes: ["orderIndex", "reps", "restSec"] },
				},
				{ model: db.User, as: "coach", attributes: ["id", "name"] },
			],
		});

		res.status(201).json(full);
	} catch (e) {
		console.error("createProgramme:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const updateProgramme = async (req, res) => {
	const parsed = updateSchema.safeParse(req.body);
	if (!parsed.success) {
		return res
			.status(400)
			.json({ message: "Payload invalide", issues: parsed.error.issues });
	}

	try {
		const programme = await db.Programme.findByPk(req.params.id);
		if (!programme)
			return res.status(404).json({ message: "Programme introuvable." });
		if (programme.coachId !== req.user.id)
			return res.status(403).json({ message: "Non autorisé." });

		const { exercises, exercices, ...rest } = parsed.data;
		await programme.update(rest);

		// Si on reçoit un tableau (EN ou FR), on remplace entièrement l'association
		const exercisesInput = exercises ?? exercices;
		if (Array.isArray(exercisesInput)) {
			await db.ProgrammeExercice.destroy({
				where: { programmeId: programme.id },
			});

			const rows = exercisesInput
				.map((e) => ({
					programmeId: programme.id,
					exerciceId: e.exerciseId ?? e.exerciceId,
					orderIndex: e.orderIndex ?? null,
					reps: e.reps ?? null,
					restSec: e.restSec ?? null,
				}))
				.filter((r) => r.exerciceId);

			if (rows.length) {
				await db.ProgrammeExercice.bulkCreate(rows);
			}
		}

		const full = await db.Programme.findByPk(programme.id, {
			include: [
				{
					model: db.Exercice,
					as: "exercices",
					through: { attributes: ["orderIndex", "reps", "restSec"] },
				},
				{ model: db.User, as: "coach", attributes: ["id", "name"] },
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
		const programme = await db.Programme.findByPk(req.params.id);
		if (!programme)
			return res.status(404).json({ message: "Programme introuvable." });
		if (programme.coachId !== req.user.id)
			return res.status(403).json({ message: "Non autorisé." });

		await db.ProgrammeExercice.destroy({
			where: { programmeId: programme.id },
		});
		await programme.destroy();
		res.json({ message: "Programme supprimé." });
	} catch (e) {
		console.error("deleteProgramme:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};
