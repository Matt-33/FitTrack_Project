import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ message: "Token manquant ou invalide." });
	}

	const token = authHeader.split(" ")[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded; // On attache l'user décodé à la requête
		next();
	} catch (err) {
		return res.status(401).json({ message: "Token invalide ou expiré." });
	}
};

export default verifyToken;
