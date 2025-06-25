import { DataTypes } from "sequelize";

const WorkoutModel = (sequelize) => {
	return sequelize.define("Workout", {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		reps: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		type: {
			type: DataTypes.ENUM("coach", "client"),
			defaultValue: "client",
		},
	});
};

export default WorkoutModel;
