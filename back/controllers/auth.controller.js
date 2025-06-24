import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../models/index.js";

const User = db.User;

export const register = async (req, res) => {
	const { name, email, password, role } = req.body;

	try {
		// Vérifie si l'utilisateur existe déjà
		const existingUser = await User.findOne({ where: { email } });
		if (existingUser) {
			return res.status(400).json({ message: "Email déjà utilisé." });
		}

		// Hash du mot de passe
		const hashedPassword = await bcrypt.hash(password, 10);

		// Création de l'utilisateur
		const user = await User.create({
			name,
			email,
			password: hashedPassword,
			role: role || "client",
		});

		// Génération du token
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
	const { email, password } = req.body;

	try {
		// Vérifie si l'utilisateur existe
		const user = await User.findOne({ where: { email } });
		if (!user) {
			return res.status(400).json({ message: "Email incorrect." });
		}

		// Vérifie le mot de passe
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Mot de passe incorrect." });
		}

		// Génère un token
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
