import { DataTypes } from "sequelize";

const ExerciceModel = (sequelize) => {
	return sequelize.define("Exercice", {
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		name: { type: DataTypes.STRING, allowNull: false },
		targetMuscle: { type: DataTypes.STRING, allowNull: true },
		mediaUrl: { type: DataTypes.STRING, allowNull: true },
		defaultReps: { type: DataTypes.STRING, allowNull: true },
	});
};

export default ExerciceModel;
