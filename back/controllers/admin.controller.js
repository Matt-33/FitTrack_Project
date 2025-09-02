import { db } from "../models/index.js";
import { z } from "zod";

export const showLogin = (req, res) => {
	res.render("login", { title: "Admin – Connexion" });
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

export const dashboard = (req, res) => {
	res.redirect("/admin/users");
};

// --- Users CRUD ---

export const listUsers = async (req, res) => {
	const q = (req.query.q || "").trim();
	const where = {};
	if (q) {
		// recherche simple par name/email
		where[db.Sequelize.Op.or] = [
			{ name: { [db.Sequelize.Op.like]: `%${q}%` } },
			{ email: { [db.Sequelize.Op.like]: `%${q}%` } },
		];
	}
	const users = await db.User.findAll({
		where,
		order: [["createdAt", "DESC"]],
		attributes: ["id", "name", "email", "role", "createdAt"],
	});
	res.render("users/index", { title: "Admin – Utilisateurs", users, q });
};

export const editUserForm = async (req, res) => {
	const user = await db.User.findByPk(req.params.id, {
		attributes: ["id", "name", "email", "role"],
	});
	if (!user) return res.status(404).send("Introuvable");
	res.render("users/edit", { title: "Admin – Éditer", user });
};

const updateSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	role: z.enum(["client", "coach"]), // on reste sur l’ENUM actuel
});

export const updateUser = async (req, res) => {
	const parsed = updateSchema.safeParse(req.body);
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
