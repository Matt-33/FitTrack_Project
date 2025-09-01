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

const router = express.Router();

// Public
router.get("/", listProgrammes);
router.get("/:id", getProgramme);

// Coach only
router.post("/", verifyToken, isCoach, createProgramme);
router.put("/:id", verifyToken, isCoach, updateProgramme);
router.delete("/:id", verifyToken, isCoach, deleteProgramme);

export default router;
