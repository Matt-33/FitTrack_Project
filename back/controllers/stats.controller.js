import { db } from "../models/index.js";
import { getWeekBounds } from "../helpers/date.js";

const { Sequelize, WorkoutHistory } = db;
const { Op, fn, col } = Sequelize;

export const myStats = async (req, res) => {
	try {
		const userId = req.user.id;
		const totalsRow = await WorkoutHistory.findOne({
			attributes: [
				[fn("COUNT", col("id")), "sessions"],
				[
					fn("COALESCE", fn("SUM", col("durationMin")), 0),
					"durationMin",
				],
			],
			where: { userId },
			raw: true,
		});

		const totals = {
			sessions: Number(totalsRow?.sessions || 0),
			durationMin: Number(totalsRow?.durationMin || 0),
		};
		const { start, end } = getWeekBounds(new Date());

		const weekRow = await WorkoutHistory.findOne({
			attributes: [
				[fn("COUNT", col("id")), "sessions"],
				[
					fn("COALESCE", fn("SUM", col("durationMin")), 0),
					"durationMin",
				],
			],
			where: {
				userId,
				performedAt: { [Op.gte]: start, [Op.lt]: end },
			},
			raw: true,
		});

		const thisWeek = {
			sessions: Number(weekRow?.sessions || 0),
			durationMin: Number(weekRow?.durationMin || 0),
		};
		const targets = { weekDurationMin: 150 };

		res.json({ totals, thisWeek, targets });
	} catch (e) {
		console.error("myStats:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};
