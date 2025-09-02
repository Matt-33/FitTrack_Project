import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		dialect: "mysql",
		logging: false,
	}
);

import UserModel from "./User.js";
import WorkoutModel from "./Workout.js";
import ProgrammeModel from "./Programme.js";
import ExerciceModel from "./Exercice.js";
import ProgrammeExerciceModel from "./ProgrammeExercice.js";
import WorkoutHistoryModel from "./WorkoutHistory.js";
import ProgrammeUserModel from "./ProgrammeUser.js";

// Initialisation des modèles

const ProgrammeUser = ProgrammeUserModel(sequelize);
const User = UserModel(sequelize);
const Workout = WorkoutModel(sequelize);
const Programme = ProgrammeModel(sequelize);
const Exercice = ExerciceModel(sequelize);
const ProgrammeExercice = ProgrammeExerciceModel(sequelize);
const WorkoutHistory = WorkoutHistoryModel(sequelize);

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

// Historique: un user journalise des séances sur un programme et/ou un exercice
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
