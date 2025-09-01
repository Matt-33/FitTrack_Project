import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!process.env.JWT_SECRET) {
		return res
			.status(500)
			.json({ message: "JWT_SECRET manquant côté serveur." });
	}
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ message: "Token manquant ou invalide." });
	}

	const token = authHeader.split(" ")[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(401).json({ message: "Token invalide ou expiré." });
	}
};

export default verifyToken;
