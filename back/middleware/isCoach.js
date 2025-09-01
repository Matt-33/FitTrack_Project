import { db } from "../models/index.js";

const isCoach = async (req, res, next) => {
	try {
		const user = await db.User.findByPk(req.user.id, {
			attributes: ["id", "role"],
		});
		if (!user || user.role !== "coach") {
			return res
				.status(403)
				.json({ message: "Accès réservé aux coachs." });
		}
		next();
	} catch (e) {
		return res.status(500).json({ message: "Erreur serveur." });
	}
};

export default isCoach;
