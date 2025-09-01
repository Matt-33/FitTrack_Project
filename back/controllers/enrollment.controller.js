import { db } from "../models/index.js";
import { z } from "zod";

const enrollSchema = z.object({
	programmeId: z.number().int().positive(),
});

export const enroll = async (req, res) => {
	const parse = enrollSchema.safeParse(req.body);
	if (!parse.success)
		return res
			.status(400)
			.json({ message: "Payload invalide", issues: parse.error.issues });
	const { programmeId } = parse.data;

	try {
		const prog = await db.Programme.findByPk(programmeId, {
			attributes: ["id", "isPublished", "coachId"],
		});
		if (!prog)
			return res.status(404).json({ message: "Programme introuvable." });
		if (!prog.isPublished && prog.coachId !== req.user.id) {
			return res.status(403).json({ message: "Programme non publié." });
		}

		await db.ProgrammeUser.findOrCreate({
			where: { userId: req.user.id, programmeId: prog.id },
			defaults: { userId: req.user.id, programmeId: prog.id },
		});

		res.status(201).json({ message: "Inscription enregistrée." });
	} catch (e) {
		console.error("enroll:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const unenroll = async (req, res) => {
	const programmeId = parseInt(req.params.programmeId, 10);
	if (!Number.isInteger(programmeId) || programmeId <= 0)
		return res.status(400).json({ message: "programmeId invalide." });

	try {
		const deleted = await db.ProgrammeUser.destroy({
			where: { userId: req.user.id, programmeId },
		});
		if (!deleted)
			return res
				.status(404)
				.json({ message: "Inscription introuvable." });
		res.json({ message: "Inscription supprimée." });
	} catch (e) {
		console.error("unenroll:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const myProgrammes = async (req, res) => {
	try {
		const programmes = await db.Programme.findAll({
			include: [
				{
					model: db.User,
					as: "participants",
					attributes: [],
					where: { id: req.user.id },
				},
				{ model: db.User, as: "coach", attributes: ["id", "name"] },
			],
			order: [["createdAt", "DESC"]],
		});
		res.json(programmes);
	} catch (e) {
		console.error("myProgrammes:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};
