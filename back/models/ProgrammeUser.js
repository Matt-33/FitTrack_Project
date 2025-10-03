import { DataTypes } from "sequelize";

export default (sequelize) => {
	const ProgrammeUser = sequelize.define(
		"ProgrammeUser",
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			userId: { type: DataTypes.INTEGER, allowNull: false },
			programmeId: { type: DataTypes.INTEGER, allowNull: false },
		},
		{
			tableName: "ProgrammeUsers",
			timestamps: true,
			indexes: [{ unique: true, fields: ["userId", "programmeId"] }],
		}
	);

	return ProgrammeUser;
};
