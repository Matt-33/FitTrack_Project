import { DataTypes } from "sequelize";

const WorkoutHistoryModel = (sequelize) => {
	return sequelize.define("WorkoutHistory", {
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		performedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		notes: { type: DataTypes.TEXT, allowNull: true },
		weightUsed: { type: DataTypes.STRING, allowNull: true },
		durationMin: { type: DataTypes.INTEGER, allowNull: true },
	});
};

export default WorkoutHistoryModel;
