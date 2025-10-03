import express from "express";
import verifyToken from "../middleware/auth.js";
import { logWorkout, myHistory } from "../controllers/history.controller.js";
import { validate } from "../middleware/validate.js";
import { historyLogSchema } from "../validators/history.validator.js";

const router = express.Router();

router.get("/", verifyToken, myHistory);
router.post("/", verifyToken, validate(historyLogSchema), logWorkout);

export default router;
