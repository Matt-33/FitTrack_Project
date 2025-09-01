import { DataTypes } from "sequelize";

const ProgrammeExerciceModel = (sequelize) => {
	return sequelize.define("ProgrammeExercice", {
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		orderIndex: { type: DataTypes.INTEGER, allowNull: true },
		reps: { type: DataTypes.STRING, allowNull: true },
		restSec: { type: DataTypes.INTEGER, allowNull: true },
	});
};
export default ProgrammeExerciceModel;
