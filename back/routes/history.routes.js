import express from "express";
import verifyToken from "../middleware/auth.js";
import {
	logWorkout,
	myHistory,
	getHistoryItem,
} from "../controllers/history.controller.js";
import { validate } from "../middleware/validate.js";
import { historyLogSchema } from "../validators/history.validator.js";

const router = express.Router();

router.get("/", verifyToken, myHistory);
router.get("/:id", verifyToken, getHistoryItem);
router.post("/", verifyToken, validate(historyLogSchema), logWorkout);

export default router;
