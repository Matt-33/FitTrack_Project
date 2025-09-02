import express from "express";
import verifyToken from "../middleware/auth.js";
import { getProfile } from "../controllers/user.controller.js";
import {
	updateProfile,
	changePassword,
	upgradeToCoach,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", verifyToken, getProfile);
router.patch("/me", verifyToken, updateProfile);
router.post("/change-password", verifyToken, changePassword);
router.post("/coach/upgrade", verifyToken, upgradeToCoach);

export default router;
