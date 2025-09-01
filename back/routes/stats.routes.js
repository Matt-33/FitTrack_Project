import express from "express";
import verifyToken from "../middleware/auth.js";
import { myStats } from "../controllers/stats.controller.js";

const router = express.Router();
router.get("/me", verifyToken, myStats);
export default router;
