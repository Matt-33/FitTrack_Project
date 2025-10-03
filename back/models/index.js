import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Priorité à une URL complète (Railway expose MYSQL_URL)
const DB_URL =
	process.env.DB_URL ||
	process.env.MYSQL_URL || // si tu veux directement pointer sur MYSQL_URL
	process.env.DATABASE_URL ||
	""; // au cas où

let sequelize;

if (DB_URL) {
	// Ex: mysql://root:pass@mysql.railway.internal:3306/railway
	sequelize = new Sequelize(DB_URL, {
		dialect: "mysql",
		logging: false,
		pool: { max: 5, min: 0, idle: 10000 },
	});
} else {
	// Fallback local (env .env de dev)
	sequelize = new Sequelize(
		process.env.DB_NAME,
		process.env.DB_USER,
		process.env.DB_PASSWORD,
		{
			host: process.env.DB_HOST || "127.0.0.1",
			port: Number(process.env.DB_PORT || 3306),
			dialect: "mysql",
			logging: false,
			pool: { max: 5, min: 0, idle: 10000 },
		}
	);
}

import UserModel from "./User.js";
import WorkoutModel from "./Workout.js";
import ProgrammeModel from "./Programme.js";
import ExerciceModel from "./Exercice.js";
import ProgrammeExerciceModel from "./ProgrammeExercice.js";
import WorkoutHistoryModel from "./WorkoutHistory.js";
import ProgrammeUserModel from "./ProgrammeUser.js";

// ----- Init modèles
const ProgrammeUser = ProgrammeUserModel(sequelize);
const User = UserModel(sequelize);
const Workout = WorkoutModel(sequelize);
const Programme = ProgrammeModel(sequelize);
const Exercice = ExerciceModel(sequelize);
const ProgrammeExercice = ProgrammeExerciceModel(sequelize);
const WorkoutHistory = WorkoutHistoryModel(sequelize);

// ----- Relations
User.hasMany(Workout, { foreignKey: "userId" });
Workout.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Programme, { as: "coachProgrammes", foreignKey: "coachId" });
Programme.belongsTo(User, { as: "coach", foreignKey: "coachId" });

Programme.belongsToMany(Exercice, {
	through: ProgrammeExercice,
	as: "exercices",
	foreignKey: "programmeId",
	otherKey: "exerciceId",
});
Exercice.belongsToMany(Programme, {
	through: ProgrammeExercice,
	as: "programmes",
	foreignKey: "exerciceId",
	otherKey: "programmeId",
});

User.belongsToMany(Programme, {
	through: ProgrammeUser,
	as: "enrolledProgrammes",
	foreignKey: "userId",
	otherKey: "programmeId",
});
Programme.belongsToMany(User, {
	through: ProgrammeUser,
	as: "participants",
	foreignKey: "programmeId",
	otherKey: "userId",
});

/* 🔹 AJOUTER CES ASSOCIATIONS POUR POUVOIR INCLURE DEPUIS LE PIVOT */
ProgrammeUser.belongsTo(User, { foreignKey: "userId" });
ProgrammeUser.belongsTo(Programme, { foreignKey: "programmeId" });
User.hasMany(ProgrammeUser, { foreignKey: "userId", as: "enrollments" });
Programme.hasMany(ProgrammeUser, {
	foreignKey: "programmeId",
	as: "enrollments",
});

// Historique
User.hasMany(WorkoutHistory, { foreignKey: "userId" });
WorkoutHistory.belongsTo(User, { foreignKey: "userId" });

Programme.hasMany(WorkoutHistory, { foreignKey: "programmeId" });
WorkoutHistory.belongsTo(Programme, { foreignKey: "programmeId" });

Exercice.hasMany(WorkoutHistory, { foreignKey: "exerciceId" });
WorkoutHistory.belongsTo(Exercice, { foreignKey: "exerciceId" });

export const db = {
	sequelize,
	Sequelize,
	User,
	Workout,
	Programme,
	Exercice,
	ProgrammeExercice,
	WorkoutHistory,
	ProgrammeUser,
};
