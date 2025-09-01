import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { db } from "./models/index.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import workoutRoutes from "./routes/workout.routes.js";
import programmeRoutes from "./routes/programme.routes.js";
import exerciceRoutes from "./routes/exercice.routes.js";
import historyRoutes from "./routes/history.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import statsRoutes from "./routes/stats.routes.js";

dotenv.config();

const app = express();

// --- Sécurité & middlewares globaux ---
const origins = (process.env.CORS_ORIGINS || "http://localhost:5173")
	.split(",")
	.map((s) => s.trim())
	.filter(Boolean);

app.use(helmet());
app.use(
	cors({
		origin: (origin, cb) => {
			if (!origin || origins.includes(origin)) return cb(null, true);
			return cb(new Error("CORS: origin non autorisée"));
		},
		credentials: true,
	})
);
app.use(express.json({ limit: "1mb" }));

// Anti-bourrinage
app.set("trust proxy", 1);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// --- Routes ---
app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/", (req, res) => res.send("🎯 FitTrack backend opérationnel !"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/programmes", programmeRoutes);
app.use("/api/exercices", exerciceRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/stats", statsRoutes);

// --- Démarrage + sync DB (alter uniquement en dev) ---
const PORT = process.env.PORT || 5000;
const isDev = (process.env.NODE_ENV || "development") !== "production";
const syncOptions = isDev ? { alter: true } : {};

db.sequelize
	.sync(syncOptions)
	.then(() => {
		console.log("✅ Base synchronisée !");
		app.listen(PORT, () =>
			console.log(`🚀 Serveur lancé : http://localhost:${PORT}`)
		);
	})
	.catch((err) => {
		console.error("❌ Erreur de synchronisation :", err);
		process.exit(1);
	});

export default app;
