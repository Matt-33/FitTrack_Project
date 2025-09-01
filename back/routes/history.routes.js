import express from "express";
import verifyToken from "../middleware/auth.js";
import { logWorkout, myHistory } from "../controllers/history.controller.js";

const router = express.Router();

router.get("/", verifyToken, myHistory);
router.post("/", verifyToken, logWorkout);

export default router;
