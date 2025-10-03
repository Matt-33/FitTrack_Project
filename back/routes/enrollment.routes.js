import express from "express";
import verifyToken from "../middleware/auth.js";
import {
	createEnrollment,
	deleteEnrollment,
	myEnrollments,
} from "../controllers/enrollment.controller.js";

const router = express.Router();

router.use(verifyToken);

// S'inscrire à un programme
router.post("/", createEnrollment);

// Se désinscrire d’un programme
router.delete("/:programmeId", deleteEnrollment);

// Mes programmes (abonnements)
router.get("/mine", myEnrollments);

export default router;
