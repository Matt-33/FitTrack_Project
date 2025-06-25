import { db } from "../models/index.js";
const User = db.User;

export const getProfile = async (req, res) => {
	try {
		const user = await User.findByPk(req.user.id, {
			attributes: ["id", "name", "email", "role"],
		});

		if (!user) {
			return res.status(404).json({ message: "Utilisateur non trouvé." });
		}

		res.json(user);
	} catch (error) {
		console.error("❌ Erreur /me :", error);
		res.status(500).json({ message: "Erreur serveur." });
	}
};
