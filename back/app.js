import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
	res.send("🎯 FitTrack backend est opérationnel !");
});

// Connexion DB + démarrage serveur
const PORT = process.env.PORT || 5000;

sequelize
	.authenticate()
	.then(() => {
		console.log("✅ Connexion à la BDD réussie !");
		app.listen(PORT, () =>
			console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`)
		);
	})
	.catch((err) => {
		console.error("❌ Erreur de connexion à la BDD :", err);
	});
