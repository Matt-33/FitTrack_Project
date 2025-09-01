import express from "express";
import verifyToken from "../middleware/auth.js";
import {
	enroll,
	unenroll,
	myProgrammes,
} from "../controllers/enrollment.controller.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", enroll);
router.delete("/:programmeId", unenroll);
router.get("/mine", myProgrammes);

export default router;
