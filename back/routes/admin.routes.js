import express from "express";
import {
	showLogin,
	doLogin,
	logout,
	dashboard,
	listUsers,
	editUserForm,
	updateUser,
	deleteUser,
} from "../controllers/admin.controller.js";
import { requireAdmin, ensureLoggedOut } from "../middleware/adminAuth.js";

const router = express.Router();
router.use((req, res, next) => {
	if (typeof req.csrfToken === "function") {
		res.locals.csrfToken = req.csrfToken();
	}
	next();
});

router.get("/login", ensureLoggedOut, showLogin);
router.post("/login", ensureLoggedOut, doLogin);
router.post("/logout", requireAdmin, logout);

router.get("/", requireAdmin, dashboard);

// Users
router.get("/users", requireAdmin, listUsers);
router.get("/users/:id/edit", requireAdmin, editUserForm);
router.post("/users/:id", requireAdmin, updateUser);
router.post("/users/:id/delete", requireAdmin, deleteUser);

export default router;
