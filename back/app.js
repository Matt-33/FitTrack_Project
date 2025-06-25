import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./models/index.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import workoutRoutes from "./routes/workout.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workouts", workoutRoutes);

app.get("/", (req, res) => {
	res.send("🎯 FitTrack backend opérationnel !");
});

const PORT = process.env.PORT || 5000;

db.sequelize
	.sync({ alter: true })
	.then(() => {
		console.log("✅ Base synchronisée !");
		app.listen(PORT, () =>
			console.log(`🚀 Serveur lancé : http://localhost:${PORT}`)
		);
	})
	.catch((err) => {
		console.error("❌ Erreur de synchronisation :", err);
	});
