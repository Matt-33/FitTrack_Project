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
import { validate } from "../middleware/validate.js";
import {
	exerciceCreateSchema,
	exerciceUpdateSchema,
} from "../validators/exercice.validator.js";

const router = express.Router();

router.get("/", listExercices);
router.get("/:id", getExercice);

router.post(
	"/",
	verifyToken,
	isCoach,
	validate(exerciceCreateSchema),
	createExercice
);
router.put(
	"/:id",
	verifyToken,
	isCoach,
	validate(exerciceUpdateSchema),
	updateExercice
);
router.delete("/:id", verifyToken, isCoach, deleteExercice);

export default router;
