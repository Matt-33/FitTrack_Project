import { db } from "../models/index.js";
import { z } from "zod";
const { Op, fn, col, literal } = db.Sequelize;

/* -------- Auth -------- */
export const showLogin = (req, res) => {
	res.render("login", { title: "Admin – Connexion", isLogin: true });
};
export const doLogin = (req, res) => {
	const { email, password } = req.body || {};
	if (
		email === (process.env.ADMIN_EMAIL || "admin@fittrack.local") &&
		password === (process.env.ADMIN_PASSWORD || "admin123")
	) {
		req.session.admin = {
			loggedIn: true,
			name: process.env.ADMIN_NAME || "Admin",
			email,
		};
		return res.redirect("/admin");
	}
	req.flash("error", "Identifiants invalides");
	res.redirect("/admin/login");
};
export const logout = (req, res) => {
	req.session.admin = null;
	res.redirect("/admin/login");
};

/* -------- Dashboard (stats) -------- */
export const dashboard = async (req, res) => {
	// Périodes
	const now = new Date();
	const start7 = new Date();
	start7.setDate(now.getDate() - 6);
	start7.setHours(0, 0, 0, 0);

	const [
		totalUsers,
		clients,
		coaches,
		programmes,
		exercices,
		enrollmentsCount,
		sessionsCount,
		sessionsByDay,
		signupsByDay,
	] = await Promise.all([
		db.User.count(),
		db.User.count({ where: { role: "client" } }),
		db.User.count({ where: { role: "coach" } }),
		db.Programme.count(),
		db.Exercice.count(),
		db.Enrollment ? db.Enrollment.count() : Promise.resolve(0),
		db.WorkoutHistory.count(),
		db.WorkoutHistory.findAll({
			attributes: [
				[fn("DATE", col("performedAt")), "d"],
				[fn("COUNT", "*"), "c"],
			],
			where: { performedAt: { [Op.gte]: start7 } },
			group: [literal("DATE(performedAt)")],
			raw: true,
		}),
		db.User.findAll({
			attributes: [
				[fn("DATE", col("createdAt")), "d"],
				[fn("COUNT", "*"), "c"],
			],
			where: { createdAt: { [Op.gte]: start7 } },
			group: [literal("DATE(createdAt)")],
			raw: true,
		}),
	]);

	// Normalisation des séries 7 jours
	const days = Array.from({ length: 7 }).map((_, i) => {
		const d = new Date(start7);
		d.setDate(start7.getDate() + i);
		return d.toISOString().slice(0, 10);
	});
	const mapToSeries = (rows) => {
		const dict = Object.fromEntries(rows.map((r) => [r.d, Number(r.c)]));
		return days.map((d) => dict[d] || 0);
	};

	const stats = {
		cards: {
			totalUsers,
			clients,
			coaches,
			programmes,
			exercices,
			enrollments: enrollmentsCount,
			sessions: sessionsCount,
		},
		charts: {
			days,
			sessions7: mapToSeries(sessionsByDay),
			signups7: mapToSeries(signupsByDay),
		},
	};

	res.render("dashboard", {
		title: "Admin – Dashboard",
		page: "dashboard",
		stats,
	});
};

/* -------- Users -------- */
export const listUsers = async (req, res) => {
	const q = (req.query.q || "").trim();
	const where = q
		? {
				[Op.or]: [
					{ name: { [Op.like]: `%${q}%` } },
					{ email: { [Op.like]: `%${q}%` } },
				],
		  }
		: {};
	const users = await db.User.findAll({
		where,
		order: [["createdAt", "DESC"]],
		attributes: ["id", "name", "email", "role", "createdAt"],
		raw: true,
	});
	res.render("users/index", {
		title: "Admin – Utilisateurs",
		page: "users",
		users,
		q,
	});
};
export const editUserForm = async (req, res) => {
	const user = await db.User.findByPk(req.params.id, {
		attributes: ["id", "name", "email", "role"],
		raw: true,
	});
	if (!user) return res.status(404).send("Introuvable");
	res.render("users/edit", { title: "Admin – Éditer", page: "users", user });
};
const updateUserSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	role: z.enum(["client", "coach"]),
});
export const updateUser = async (req, res) => {
	const parsed = updateUserSchema.safeParse(req.body);
	if (!parsed.success) {
		req.flash("error", "Payload invalide");
		return res.redirect(`/admin/users/${req.params.id}/edit`);
	}
	const user = await db.User.findByPk(req.params.id);
	if (!user) {
		req.flash("error", "Utilisateur introuvable");
		return res.redirect("/admin/users");
	}
	await user.update(parsed.data);
	req.flash("success", "Utilisateur mis à jour");
	res.redirect("/admin/users");
};
export const deleteUser = async (req, res) => {
	const user = await db.User.findByPk(req.params.id);
	if (!user) {
		req.flash("error", "Utilisateur introuvable");
		return res.redirect("/admin/users");
	}
	await user.destroy();
	req.flash("success", "Utilisateur supprimé");
	res.redirect("/admin/users");
};

/* -------- Programmes -------- */
const progSchema = z.object({
	title: z.string().min(2),
	level: z
		.enum(["debutant", "intermediaire", "avance"])
		.optional()
		.nullable(),
	goal: z
		.enum(["force", "endurance", "perte_de_poids", "hypertrophie"])
		.optional()
		.nullable(),
	description: z.string().optional().nullable(),
	isPublished: z.any().transform((v) => v === "on" || v === true),
});
export const listProgrammes = async (req, res) => {
	const progs = await db.Programme.findAll({
		include: [{ model: db.User, as: "coach", attributes: ["id", "name"] }],
		order: [["createdAt", "DESC"]],
		attributes: [
			"id",
			"title",
			"level",
			"goal",
			"isPublished",
			"createdAt",
		],
		raw: true,
		nest: true,
	});
	res.render("programmes/index", {
		title: "Admin – Programmes",
		page: "programmes",
		progs,
	});
};
export const editProgrammeForm = async (req, res) => {
	const p = await db.Programme.findByPk(req.params.id, {
		include: [{ model: db.User, as: "coach", attributes: ["id", "name"] }],
		attributes: [
			"id",
			"title",
			"level",
			"goal",
			"description",
			"isPublished",
		],
		raw: true,
		nest: true,
	});
	if (!p) return res.status(404).send("Introuvable");
	res.render("programmes/edit", {
		title: "Admin – Éditer programme",
		page: "programmes",
		p,
	});
};
export const updateProgramme = async (req, res) => {
	const parsed = progSchema.safeParse(req.body);
	if (!parsed.success) {
		req.flash("error", "Payload invalide");
		return res.redirect(`/admin/programmes/${req.params.id}/edit`);
	}
	const p = await db.Programme.findByPk(req.params.id);
	if (!p) {
		req.flash("error", "Programme introuvable");
		return res.redirect("/admin/programmes");
	}
	await p.update(parsed.data);
	req.flash("success", "Programme mis à jour");
	res.redirect("/admin/programmes");
};
export const deleteProgramme = async (req, res) => {
	const p = await db.Programme.findByPk(req.params.id);
	if (!p) {
		req.flash("error", "Programme introuvable");
		return res.redirect("/admin/programmes");
	}
	await db.ProgrammeExercice.destroy({ where: { programmeId: p.id } }).catch(
		() => {}
	);
	await p.destroy();
	req.flash("success", "Programme supprimé");
	res.redirect("/admin/programmes");
};

/* -------- Exercices -------- */
const exSchema = z.object({
	name: z.string().min(2),
	muscleGroup: z.string().optional().nullable(),
	equipment: z.string().optional().nullable(),
});
export const listExercices = async (req, res) => {
	const items = await db.Exercice.findAll({
		attributes: ["id", "name", "targetMuscle", "defaultReps", "createdAt"],
		order: [["createdAt", "DESC"]],
		raw: true,
	});
	res.render("exercices/index", {
		title: "Admin – Exercices",
		page: "exercices",
		items,
	});
};
export const editExerciceForm = async (req, res) => {
	const ex = await db.Exercice.findByPk(req.params.id, {
		attributes: ["id", "name", "targetMuscle", "defaultReps"],
		raw: true,
	});
	if (!ex) return res.status(404).send("Introuvable");
	res.render("exercices/edit", {
		title: "Admin – Éditer exercice",
		page: "exercices",
		ex,
	});
};
export const updateExercice = async (req, res) => {
	const parsed = exSchema.safeParse(req.body);
	if (!parsed.success) {
		req.flash("error", "Payload invalide");
		return res.redirect(`/admin/exercices/${req.params.id}/edit`);
	}
	const ex = await db.Exercice.findByPk(req.params.id);
	if (!ex) {
		req.flash("error", "Exercice introuvable");
		return res.redirect("/admin/exercices");
	}
	await ex.update(parsed.data);
	req.flash("success", "Exercice mis à jour");
	res.redirect("/admin/exercices");
};
export const deleteExercice = async (req, res) => {
	const ex = await db.Exercice.findByPk(req.params.id);
	if (!ex) {
		req.flash("error", "Exercice introuvable");
		return res.redirect("/admin/exercices");
	}
	await db.ProgrammeExercice.destroy({ where: { exerciceId: ex.id } }).catch(
		() => {}
	);
	await ex.destroy();
	req.flash("success", "Exercice supprimé");
	res.redirect("/admin/exercices");
};
