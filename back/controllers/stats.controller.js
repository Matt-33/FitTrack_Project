import { db } from "../models/index.js";
import { Op, fn, col, literal } from "sequelize";

export const myStats = async (req, res) => {
	try {
		const userId = req.user.id;

		const [totals, last7] = await Promise.all([
			db.WorkoutHistory.findAll({
				where: { userId },
				attributes: [
					[fn("COUNT", col("id")), "sessions"],
					[fn("SUM", col("durationMin")), "durationMin"],
				],
				raw: true,
			}),
			db.WorkoutHistory.findAll({
				where: {
					userId,
					performedAt: {
						[Op.gte]: literal("DATE_SUB(NOW(), INTERVAL 7 DAY)"),
					},
				},
				attributes: [
					[fn("DATE", col("performedAt")), "date"],
					[fn("COUNT", col("id")), "count"],
				],
				group: [literal("DATE(performedAt)")],
				order: [[literal("DATE(performedAt)"), "ASC"]],
				raw: true,
			}),
		]);

		res.json({
			totals: totals[0] || { sessions: 0, durationMin: 0 },
			last7Days: last7,
		});
	} catch (e) {
		console.error("myStats:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};
