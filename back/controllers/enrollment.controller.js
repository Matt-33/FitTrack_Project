import { z } from "zod";
import { db } from "../models/index.js";

const createSchema = z.object({
	programmeId: z.number().int().positive(),
});

/**
 * POST /api/enrollments
 * body: { programmeId }
 */
export const createEnrollment = async (req, res) => {
	const parsed = createSchema.safeParse(req.body);
	if (!parsed.success) {
		return res
			.status(400)
			.json({ message: "Payload invalide", issues: parsed.error.issues });
	}

	const { programmeId } = parsed.data;
	const programme = await db.Programme.findByPk(programmeId, {
		attributes: ["id", "title", "isPublished"],
	});
	if (!programme)
		return res.status(404).json({ message: "Programme introuvable." });
	if (programme.isPublished === false) {
		return res.status(403).json({ message: "Programme non publié." });
	}
	const [row, created] = await db.ProgrammeUser.findOrCreate({
		where: { userId: req.user.id, programmeId },
		defaults: { userId: req.user.id, programmeId },
	});

	return res.status(created ? 201 : 200).json({
		message: created ? "Inscription effectuée" : "Déjà inscrit",
		enrollment: row,
	});
};

/**
 * DELETE /api/enrollments/:programmeId
 */
export const deleteEnrollment = async (req, res) => {
	const programmeId = Number(req.params.programmeId || 0);
	if (!programmeId)
		return res.status(400).json({ message: "programmeId invalide" });

	const count = await db.ProgrammeUser.destroy({
		where: { userId: req.user.id, programmeId },
	});

	if (!count)
		return res.status(404).json({ message: "Inscription introuvable" });
	return res.json({ message: "Désinscription effectuée" });
};

/**
 * GET /api/enrollments/mine
 * -> retourne la liste des programmes suivis par l'utilisateur
 */
export const myEnrollments = async (req, res) => {
	const rows = await db.ProgrammeUser.findAll({
		where: { userId: req.user.id },
		include: [
			{
				model: db.Programme,
				attributes: [
					"id",
					"title",
					"level",
					"goal",
					"description",
					"isPublished",
				],
				include: [
					{ model: db.User, as: "coach", attributes: ["id", "name"] },
				],
			},
		],
		order: [["createdAt", "DESC"]],
	});

	const programmes = rows.map((r) => r.Programme).filter(Boolean);

	res.json(programmes);
};
