import express from "express";
import verifyToken from "../middleware/auth.js";
import isCoach from "../middleware/isCoach.js";
import {
	listProgrammes,
	getProgramme,
	createProgramme,
	updateProgramme,
	deleteProgramme,
} from "../controllers/programme.controller.js";
import { validate } from "../middleware/validate.js";
import {
	programmeCreateSchema,
	programmeUpdateSchema,
} from "../validators/programme.validator.js";

const router = express.Router();

router.get("/", listProgrammes);
router.get("/:id", getProgramme);

router.post(
	"/",
	verifyToken,
	isCoach,
	validate(programmeCreateSchema),
	createProgramme
);

router.put(
	"/:id",
	verifyToken,
	isCoach,
	validate(programmeUpdateSchema),
	updateProgramme
);

router.delete("/:id", verifyToken, isCoach, deleteProgramme);

export default router;
