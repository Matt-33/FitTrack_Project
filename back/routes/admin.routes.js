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
	listProgrammes,
	editProgrammeForm,
	updateProgramme,
	deleteProgramme,
	listExercices,
	editExerciceForm,
	updateExercice,
	deleteExercice,
} from "../controllers/admin.controller.js";
import { requireAdmin, ensureLoggedOut } from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/login", ensureLoggedOut, showLogin);
router.post("/login", ensureLoggedOut, doLogin);
router.post("/logout", requireAdmin, logout);

// Dashboard
router.get("/", requireAdmin, dashboard);

// Users
router.get("/users", requireAdmin, listUsers);
router.get("/users/:id/edit", requireAdmin, editUserForm);
router.post("/users/:id", requireAdmin, updateUser);
router.post("/users/:id/delete", requireAdmin, deleteUser);

// Programmes
router.get("/programmes", requireAdmin, listProgrammes);
router.get("/programmes/:id/edit", requireAdmin, editProgrammeForm);
router.post("/programmes/:id", requireAdmin, updateProgramme);
router.post("/programmes/:id/delete", requireAdmin, deleteProgramme);

// Exercices
router.get("/exercices", requireAdmin, listExercices);
router.get("/exercices/:id/edit", requireAdmin, editExerciceForm);
router.post("/exercices/:id", requireAdmin, updateExercice);
router.post("/exercices/:id/delete", requireAdmin, deleteExercice);

export default router;
