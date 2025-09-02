import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import session from "express-session";
import flash from "connect-flash";
import csrf from "csurf";
import { engine } from "express-handlebars";

import { db } from "./models/index.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import workoutRoutes from "./routes/workout.routes.js";
import programmeRoutes from "./routes/programme.routes.js";
import exerciceRoutes from "./routes/exercice.routes.js";
import historyRoutes from "./routes/history.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // ✅ créer l’app en premier

// ---------- View engine (Admin) ----------
app.engine(
	"hbs",
	engine({
		extname: ".hbs",
		helpers: { eq: (a, b) => a === b },
	})
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.use("/public", express.static(path.join(__dirname, "public")));

// ---------- Sécurité & middlewares globaux ----------
app.set("trust proxy", 1);

// Helmet (désactive CSP pour tolérer les vues simples)
app.use(helmet({ contentSecurityPolicy: false }));

// Sessions + flash (utilisés par /admin)
app.use(
	session({
		secret: process.env.SESSION_SECRET || "change-me-session",
		resave: false,
		saveUninitialized: false,
		cookie: { sameSite: "lax", secure: false }, // secure: true en prod HTTPS
	})
);
app.use(flash());

// Parsers (JSON + forms HTML)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true })); // ✅ nécessaire pour _csrf des formulaires

// ---------- Rate limit (global) ----------
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// ---------- Admin (avec CSRF) ----------
app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/", (req, res) => res.send("🎯 FitTrack backend opérationnel !"));

app.use(
	"/admin",
	csrf(),
	(req, res, next) => {
		res.locals.csrfToken = req.csrfToken();
		res.locals.flash = {
			error: req.flash("error"),
			success: req.flash("success"),
		};
		next();
	},
	adminRoutes
);

// ---------- CORS uniquement pour l’API ----------
const origins = (
	process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173"
)
	.split(",")
	.map((s) => s.trim())
	.filter(Boolean);

const corsMiddleware = cors({
	origin(origin, cb) {
		if (!origin) return cb(null, true);
		if (origins.includes(origin)) return cb(null, true);
		return cb(new Error("CORS: origin non autorisée"));
	},
	credentials: true,
});

// ✅ suffit amplement
app.use("/api", corsMiddleware);

// ---------- Routes API JSON ----------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/programmes", programmeRoutes);
app.use("/api/exercices", exerciceRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/stats", statsRoutes);

// ---------- Démarrage + sync DB ----------
const PORT = process.env.PORT || 5000;
const isDev = (process.env.NODE_ENV || "development") !== "production";

// Pilotage via .env: DB_SYNC=force | alter | safe
const syncMode = process.env.DB_SYNC || "safe";
let syncOptions = {};
if (syncMode === "force") syncOptions = { force: true };
if (syncMode === "alter") syncOptions = { alter: true };
if (syncMode === "safe") syncOptions = {};

db.sequelize
	.sync(syncOptions)
	.then(() => {
		console.log("✅ Base synchronisée !", syncOptions);
		app.listen(PORT, () =>
			console.log(`🚀 Serveur lancé : http://localhost:${PORT}`)
		);
	})
	.catch((err) => {
		console.error("❌ Erreur de synchronisation :", err);
		process.exit(1);
	});

export default app;
