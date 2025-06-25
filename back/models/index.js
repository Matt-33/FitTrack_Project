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

const User = UserModel(sequelize);
const Workout = WorkoutModel(sequelize);

// 👇 Relations
User.hasMany(Workout, { foreignKey: "userId" });
Workout.belongsTo(User, { foreignKey: "userId" });

export const db = {
	sequelize,
	Sequelize,
	User,
	Workout,
};
