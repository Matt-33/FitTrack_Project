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

// Models
import UserModel from "./User.js";
// import WorkoutModel from "./Workout.js"; // à venir
// import ProgramModel from "./Program.js"; // à venir

// Init models
const User = UserModel(sequelize);
// const Workout = WorkoutModel(sequelize);
// const Program = ProgramModel(sequelize);

// Associations (ex: User.hasMany(Workout)) — plus tard

export const db = {
	sequelize,
	Sequelize,
	User,
	// Workout,
	// Program,
};
