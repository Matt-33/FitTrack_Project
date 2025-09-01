import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../models/index.js";
import { z } from "zod";

const User = db.User;

const registerSchema = z.object({
	name: z.string().min(2, "Nom trop court"),
	email: z.string().email("Email invalide"),
	password: z.string().min(8, "Mot de passe trop court"),
});

const loginSchema = z.object({
	email: z.string().email("Email invalide"),
	password: z.string().min(1, "Mot de passe requis"),
});

export const register = async (req, res) => {
	const parse = registerSchema.safeParse(req.body);
	if (!parse.success) {
		return res
			.status(400)
			.json({ message: "Payload invalide", issues: parse.error.issues });
	}
	const { name, email, password } = parse.data;

	try {
		const existingUser = await User.findOne({ where: { email } });
		if (existingUser)
			return res.status(400).json({ message: "Email déjà utilisé." });

		const hashedPassword = await bcrypt.hash(password, 12);

		const user = await User.create({
			name,
			email,
			password: hashedPassword,
			role: "client",
		});

		const token = jwt.sign(
			{ id: user.id, email: user.email, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "24h" }
		);

		res.status(201).json({
			message: "Utilisateur créé avec succès.",
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
			token,
		});
	} catch (error) {
		console.error("❌ Erreur register :", error);
		res.status(500).json({ message: "Erreur serveur." });
	}
};

export const login = async (req, res) => {
	const parse = loginSchema.safeParse(req.body);
	if (!parse.success) {
		return res
			.status(400)
			.json({ message: "Payload invalide", issues: parse.error.issues });
	}
	const { email, password } = parse.data;

	try {
		const user = await User.findOne({ where: { email } });
		if (!user) return res.status(400).json({ message: "Email incorrect." });

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(400).json({ message: "Mot de passe incorrect." });

		const token = jwt.sign(
			{ id: user.id, email: user.email, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "24h" }
		);

		res.status(200).json({
			message: "Connexion réussie",
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
			token,
		});
	} catch (error) {
		console.error("❌ Erreur login :", error);
		res.status(500).json({ message: "Erreur serveur." });
	}
};
