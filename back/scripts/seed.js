// back/scripts/seed.js
import "dotenv/config.js";
import bcrypt from "bcryptjs";
import { db } from "../models/index.js";

const RESET = process.env.SEED_RESET === "1";

async function upsertUser({ name, email, password, role = "client" }) {
	const hash = bcrypt.hashSync("admin123", 10);
	const [user] = await db.User.findOrCreate({
		where: { email },
		defaults: { name, email, password: hash, role },
	});
	if (!user.password || user.role !== role || user.name !== name) {
		await user.update({ name, role, password: hash });
	}
	return user;
}

async function upsertExercice({ name, muscleGroup = null, equipment = null }) {
	const [ex] = await db.Exercice.findOrCreate({
		where: { name },
		defaults: { name, muscleGroup, equipment },
	});
	return ex;
}

async function upsertProgramme({
	title,
	coachId,
	level = "debutant",
	goal = "hypertrophie",
	description = "",
	isPublished = true,
}) {
	const [p] = await db.Programme.findOrCreate({
		where: { title },
		defaults: { title, coachId, level, goal, description, isPublished },
	});
	await p.update({ coachId, level, goal, description, isPublished });
	return p;
}

async function linkProgrammeExercice(
	programmeId,
	exerciceId,
	orderIndex,
	reps,
	restSec
) {
	const [row] = await db.ProgrammeExercice.findOrCreate({
		where: { programmeId, exerciceId },
		defaults: { programmeId, exerciceId, orderIndex, reps, restSec },
	});
	await row.update({ orderIndex, reps, restSec });
	return row;
}

async function enrollUserToProgramme(userId, programmeId) {
	const [row] = await db.ProgrammeUser.findOrCreate({
		where: { userId, programmeId },
		defaults: { userId, programmeId },
	});
	return row;
}

async function addWorkoutHistory({
	userId,
	programmeId = null,
	exerciceId = null,
	notes = null,
	weightUsed = null,
	durationMin = 40,
	performedAt = new Date().toISOString(),
}) {
	const row = await db.WorkoutHistory.create({
		userId,
		programmeId,
		exerciceId,
		notes,
		weightUsed,
		durationMin,
		performedAt,
	});
	return row;
}

async function main() {
	console.log("🔗 Connexion DB…");
	await db.sequelize.authenticate();
	console.log("✅ DB OK");

	if (RESET) {
		console.log("⚠️ RESET demandé (SEED_RESET=1) → TRUNCATE tables…");
		await db.WorkoutHistory.destroy({
			where: {},
			truncate: true,
			cascade: true,
			force: true,
		});
		await db.ProgrammeExercice.destroy({
			where: {},
			truncate: true,
			cascade: true,
			force: true,
		});
		await db.ProgrammeUser.destroy({
			where: {},
			truncate: true,
			cascade: true,
			force: true,
		});
		await db.Programme.destroy({
			where: {},
			truncate: true,
			cascade: true,
			force: true,
		});
		await db.Exercice.destroy({
			where: {},
			truncate: true,
			cascade: true,
			force: true,
		});
		await db.Workout.destroy({
			where: {},
			truncate: true,
			cascade: true,
			force: true,
		});
		await db.User.destroy({
			where: {},
			truncate: true,
			cascade: true,
			force: true,
		});
		console.log("✅ TRUNCATE OK");
	}

	// ——— Users
	console.log("👤 Seed users…");
	const coachAlice = await upsertUser({
		name: "Alice Coach",
		email: "alice.coach@fittrack.local",
		password: "coach1234",
		role: "coach",
	});
	const coachBob = await upsertUser({
		name: "Bob Coach",
		email: "bob.coach@fittrack.local",
		password: "coach1234",
		role: "coach",
	});

	const uMat = await upsertUser({
		name: "Matthias",
		email: "mat@fittrack.local",
		password: "client1234",
		role: "client",
	});
	const uLea = await upsertUser({
		name: "Léa",
		email: "lea@fittrack.local",
		password: "client1234",
		role: "client",
	});

	// ——— Exercices
	console.log("🏋️ Seed exercices…");
	const exSquat = await upsertExercice({
		name: "Back Squat",
		muscleGroup: "Jambes",
		equipment: "Barre",
	});
	const exBench = await upsertExercice({
		name: "Développé couché",
		muscleGroup: "Poitrine",
		equipment: "Barre",
	});
	const exRow = await upsertExercice({
		name: "Rowing barre",
		muscleGroup: "Dos",
		equipment: "Barre",
	});
	const exOhp = await upsertExercice({
		name: "Développé militaire",
		muscleGroup: "Épaules",
		equipment: "Barre/Haltères",
	});
	const exCurl = await upsertExercice({
		name: "Curl haltères",
		muscleGroup: "Biceps",
		equipment: "Haltères",
	});
	const exPlank = await upsertExercice({
		name: "Gainage",
		muscleGroup: "Core",
		equipment: "Poids du corps",
	});

	// ——— Programmes
	console.log("📘 Seed programmes…");
	const pFullBody = await upsertProgramme({
		title: "Full Body Débutant – 3 jours",
		coachId: coachAlice.id,
		level: "debutant",
		goal: "hypertrophie",
		description: "Programme complet sur 3 jours pour démarrer.",
		isPublished: true,
	});

	const pForce = await upsertProgramme({
		title: "Force Intermédiaire – 4 jours",
		coachId: coachBob.id,
		level: "intermediaire",
		goal: "force",
		description: "Accent force sur les mouvements poly-articulaires.",
		isPublished: true,
	});

	const pPerte = await upsertProgramme({
		title: "Perte de poids – 3 jours cardio + full",
		coachId: coachAlice.id,
		level: "debutant",
		goal: "perte_de_poids",
		description: "Mix cardio + renfo pour sécher proprement.",
		isPublished: true,
	});

	// ——— Liaisons Programme ↔ Exercices
	console.log("🔗 Link programme ↔ exercices…");
	await linkProgrammeExercice(pFullBody.id, exSquat.id, 1, "4x8-10", 90);
	await linkProgrammeExercice(pFullBody.id, exBench.id, 2, "4x8-10", 90);
	await linkProgrammeExercice(pFullBody.id, exRow.id, 3, "4x10-12", 75);
	await linkProgrammeExercice(pFullBody.id, exPlank.id, 4, "3x60s", 45);

	await linkProgrammeExercice(pForce.id, exSquat.id, 1, "5x5", 120);
	await linkProgrammeExercice(pForce.id, exBench.id, 2, "5x5", 120);
	await linkProgrammeExercice(pForce.id, exOhp.id, 3, "5x5", 120);
	await linkProgrammeExercice(pForce.id, exRow.id, 4, "4x6-8", 90);

	await linkProgrammeExercice(pPerte.id, exPlank.id, 1, "4x45-60s", 45);
	await linkProgrammeExercice(pPerte.id, exCurl.id, 2, "3x12-15", 60);
	await linkProgrammeExercice(pPerte.id, exRow.id, 3, "3x12-15", 60);

	// ——— Inscriptions programme_user
	console.log("📝 Inscription des clients aux programmes…");
	await enrollUserToProgramme(uMat.id, pFullBody.id);
	await enrollUserToProgramme(uMat.id, pForce.id);
	await enrollUserToProgramme(uLea.id, pPerte.id);

	// ——— Historique de séances (pour peupler les stats)
	console.log("🕒 Seed historique…");
	const now = new Date();
	const day = (n) => {
		const d = new Date(now);
		d.setDate(d.getDate() - n);
		d.setHours(18, 0, 0, 0);
		return d.toISOString();
	};

	await addWorkoutHistory({
		userId: uMat.id,
		programmeId: pFullBody.id,
		exerciceId: exSquat.id,
		durationMin: 55,
		notes: "Bonne forme, RPE ~7",
		performedAt: day(1),
	});
	await addWorkoutHistory({
		userId: uMat.id,
		programmeId: pForce.id,
		exerciceId: exBench.id,
		durationMin: 60,
		notes: "Progression +2.5kg",
		performedAt: day(3),
	});
	await addWorkoutHistory({
		userId: uLea.id,
		programmeId: pPerte.id,
		exerciceId: exPlank.id,
		durationMin: 40,
		notes: "Cardio + gainage",
		performedAt: day(2),
	});

	console.log("✅ SEED terminé !");
	process.exit(0);
}

main().catch((err) => {
	console.error("❌ SEED erreur :", err);
	process.exit(1);
});
