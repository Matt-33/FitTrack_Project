// controllers/user.controller.js
import { db } from "../models/index.js";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const getProfile = async (req, res) => {
	try {
		const user = await db.User.findByPk(req.user.id, {
			attributes: ["id", "name", "email", "role", "avatarUrl", "bio"],
		});
		if (!user)
			return res.status(404).json({ message: "Utilisateur non trouvé." });
		res.json(user);
	} catch (e) {
		console.error("❌ Erreur /me :", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

// UPDATE PROFILE
const profileSchema = z.object({
	name: z.string().min(2).max(100).optional(),
	avatarUrl: z
		.string()
		.url()
		.optional()
		.or(z.literal("").transform(() => null)),
	bio: z
		.string()
		.max(1000)
		.optional()
		.or(z.literal("").transform(() => null)),
	email: z.string().email().optional(),
});

export const updateProfile = async (req, res) => {
	const parsed = profileSchema.safeParse(req.body);
	if (!parsed.success)
		return res
			.status(400)
			.json({ message: "Payload invalide", issues: parsed.error.issues });

	try {
		const user = await db.User.findByPk(req.user.id);
		if (!user)
			return res.status(404).json({ message: "Utilisateur non trouvé." });

		// Si email changé : vérifier l'unicité
		if (parsed.data.email && parsed.data.email !== user.email) {
			const exists = await db.User.findOne({
				where: { email: parsed.data.email },
			});
			if (exists)
				return res.status(400).json({ message: "Email déjà utilisé." });
		}

		await user.update(parsed.data);
		const lean = (({ id, name, email, role, avatarUrl, bio }) => ({
			id,
			name,
			email,
			role,
			avatarUrl,
			bio,
		}))(user);
		res.json({ message: "Profil mis à jour.", user: lean });
	} catch (e) {
		console.error("updateProfile:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

// ▶️ CHANGE PASSWORD
const pwdSchema = z.object({
	currentPassword: z.string().min(6),
	newPassword: z.string().min(6),
});

export const changePassword = async (req, res) => {
	const parsed = pwdSchema.safeParse(req.body);
	if (!parsed.success)
		return res
			.status(400)
			.json({ message: "Payload invalide", issues: parsed.error.issues });

	try {
		const user = await db.User.findByPk(req.user.id);
		if (!user)
			return res.status(404).json({ message: "Utilisateur non trouvé." });

		const ok = await bcrypt.compare(
			parsed.data.currentPassword,
			user.password
		);
		if (!ok)
			return res
				.status(400)
				.json({ message: "Mot de passe actuel incorrect." });

		const hash = await bcrypt.hash(parsed.data.newPassword, 10);
		await user.update({ password: hash });

		res.json({ message: "Mot de passe mis à jour." });
	} catch (e) {
		console.error("changePassword:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

// ▶️ UPGRADE TO COACH (avec code optionnel)
const inviteCode = process.env.COACH_INVITE_CODE || null;
const upgradeSchema = z.object({ code: z.string().optional() });

export const upgradeToCoach = async (req, res) => {
	const parsed = upgradeSchema.safeParse(req.body);
	if (!parsed.success)
		return res
			.status(400)
			.json({ message: "Payload invalide", issues: parsed.error.issues });

	try {
		const user = await db.User.findByPk(req.user.id);
		if (!user)
			return res.status(404).json({ message: "Utilisateur non trouvé." });
		if (user.role === "coach")
			return res.status(400).json({ message: "Déjà coach." });

		if (inviteCode && parsed.data.code !== inviteCode) {
			return res
				.status(403)
				.json({ message: "Code d'invitation invalide." });
		}

		await user.update({ role: "coach" });
		const lean = (({ id, name, email, role, avatarUrl, bio }) => ({
			id,
			name,
			email,
			role,
			avatarUrl,
			bio,
		}))(user);
		res.json({ message: "Passage en coach réussi.", user: lean });
	} catch (e) {
		console.error("upgradeToCoach:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};
