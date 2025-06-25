import express from "express";
import verifyToken from "../middleware/auth.js";
import isCoach from "../middleware/isCoach.js";
import {
	createWorkout,
	getCoachWorkouts,
} from "../controllers/workout.controller.js";

const router = express.Router();

router.get("/", getCoachWorkouts);
router.post("/", verifyToken, isCoach, createWorkout);

export default router;
