import { DataTypes } from "sequelize";

const ProgrammeModel = (sequelize) => {
	return sequelize.define("Programme", {
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		title: { type: DataTypes.STRING, allowNull: false },
		level: {
			type: DataTypes.ENUM("debutant", "intermediaire", "avance"),
			defaultValue: "debutant",
		},
		goal: {
			type: DataTypes.ENUM(
				"force",
				"endurance",
				"perte_de_poids",
				"hypertrophie"
			),
			allowNull: true,
		},
		description: { type: DataTypes.TEXT, allowNull: true },
		isPublished: { type: DataTypes.BOOLEAN, defaultValue: false },
	});
};

export default ProgrammeModel;
