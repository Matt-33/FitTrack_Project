import { db } from "../models/index.js";
import { Op } from "sequelize";

function getWeekBounds() {
	const now = new Date();
	const day = (now.getDay() + 6) % 7;
	const start = new Date(now);
	start.setHours(0, 0, 0, 0);
	start.setDate(start.getDate() - day);
	const end = new Date(start);
	end.setDate(end.getDate() + 7);
	return { start, end };
}

export const myStats = async (req, res) => {
	try {
		const userId = req.user.id;
		const { start, end } = getWeekBounds();

		const sessionWhere = {
			userId,
			durationMin: { [Op.gt]: 0 },
		};
		const [sessionsTotal, durationTotalMin] = await Promise.all([
			db.WorkoutHistory.count({ where: sessionWhere }),
			db.WorkoutHistory.sum("durationMin", { where: sessionWhere }),
		]);

		const weeklyWhere = {
			...sessionWhere,
			[Op.or]: [
				{ performedAt: { [Op.gte]: start, [Op.lt]: end } },
				{
					performedAt: null,
					createdAt: { [Op.gte]: start, [Op.lt]: end },
				},
			],
		};

		const weeklyDurationMin =
			(await db.WorkoutHistory.sum("durationMin", {
				where: weeklyWhere,
			})) || 0;

		const weekTarget = 150;

		res.json({
			totals: {
				sessions: sessionsTotal || 0,
				durationMin: durationTotalMin || 0,
			},
			thisWeek: {
				durationMin: weeklyDurationMin,
				start: start.toISOString(),
				end: end.toISOString(),
			},
			targets: {
				weekDurationMin: weekTarget,
			},
		});
	} catch (e) {
		console.error("myStats:", e);
		res.status(500).json({ message: "Erreur serveur." });
	}
};
