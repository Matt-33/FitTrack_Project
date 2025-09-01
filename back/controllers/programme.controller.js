import { db } from "../models/index.js";
import { z } from "zod";

const createSchema = z.object({
	title: z.string().min(2),
	level: z.enum(["debutant", "intermediaire", "avance"]).optional(),
	goal: z
		.enum(["force", "endurance", "perte_de_poids", "hypertrophie"])
		.optional(),
	description: z.string().optional().nullable(),
	isPublished: z.boolean().optional(),
	exercices: z
		.array(
			z.object({
				exerciceId: z.number().int().positive().optional(),
				exerciceId: z.number().int().positive().optional(),
				orderIndex: z.number().int().nonnegative().optional(),
				reps: z.string().optional(),
				restSec: z.number().int().nonnegative().optional(),
			})
		)
		.optional(),
});

export const listProgrammes = async (req, res) => {
	const page = Math.max(parseInt(req.query.page || "1"), 1);
	const limit = Math.min(Math.max(parseInt(req.query.limit || "10"), 1), 50);
	const offset = (page - 1) * limit;

	try {
		const { rows, count } = await db.Programme.findAndCountAll({
			where: { isPublished: true },
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
				{ model: db.Exercice, as: "exercices" },
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
	const parse = createSchema.safeParse(req.body);
	if (!parse.success)
		return res
			.status(400)
			.json({ message: "Payload invalide", issues: parse.error.issues });

	const { title, level, goal, description, isPublished, exercices } =
		parse.data;
	try {
		const programme = await db.Programme.create({
			title,
			level,
			goal,
			description,
			isPublished: !!isPublished,
			coachId: req.user.id,
		});

		if (Array.isArray(exercices) && exercices.length) {
			const rows = exercices.map((e) => ({
				programmeId: programme.id,
				// on supporte exerciceId (FR) et exerciceId (EN) pour éviter les 400
				exerciceId: e.exerciceId ?? e.exerciceId,
				orderIndex: e.orderIndex ?? null,
				reps: e.reps ?? null,
				restSec: e.restSec ?? null,
			}));
			await db.ProgrammeExercice.bulkCreate(rows);
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
	const parse = createSchema.partial().safeParse(req.body);
	if (!parse.success)
		return res
			.status(400)
			.json({ message: "Payload invalide", issues: parse.error.issues });

	try {
		const programme = await db.Programme.findByPk(req.params.id);
		if (!programme)
			return res.status(404).json({ message: "Programme introuvable." });
		if (programme.coachId !== req.user.id)
			return res.status(403).json({ message: "Non autorisé." });

		await programme.update(parse.data);

		// Remplacer le set d'exercices si un tableau est fourni
		if (Array.isArray(parse.data.exercices)) {
			await db.ProgrammeExercice.destroy({
				where: { programmeId: programme.id },
			});
			const rows = parse.data.exercices.map((e) => ({
				programmeId: programme.id,
				exerciceId: e.exerciceId ?? e.exerciceId,
				orderIndex: e.orderIndex ?? null,
				reps: e.reps ?? null,
				restSec: e.restSec ?? null,
			}));
			await db.ProgrammeExercice.bulkCreate(rows);
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
