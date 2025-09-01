import { DataTypes } from "sequelize";

const ProgrammeUserModel = (sequelize) => {
	return sequelize.define(
		"ProgrammeUser",
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
		},
		{
			indexes: [{ unique: true, fields: ["userId", "programmeId"] }],
		}
	);
};

export default ProgrammeUserModel;
