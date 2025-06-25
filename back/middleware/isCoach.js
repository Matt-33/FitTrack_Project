const isCoach = (req, res, next) => {
	if (req.user.role !== "coach") {
		return res.status(403).json({ message: "Accès réservé aux coachs." });
	}
	next();
};

export default isCoach;
