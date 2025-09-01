import express from "express";
import verifyToken from "../middleware/auth.js";
import isCoach from "../middleware/isCoach.js";
import {
	listExercices,
	getExercice,
	createExercice,
	updateExercice,
	deleteExercice,
} from "../controllers/exercice.controller.js";

const router = express.Router();

// Public
router.get("/", listExercices);
router.get("/:id", getExercice);

// Coach only
router.post("/", verifyToken, isCoach, createExercice);
router.put("/:id", verifyToken, isCoach, updateExercice);
router.delete("/:id", verifyToken, isCoach, deleteExercice);

export default router;
