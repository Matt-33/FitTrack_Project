import { DataTypes } from "sequelize";

const UserModel = (sequelize) => {
	return sequelize.define("User", {
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		name: { type: DataTypes.STRING, allowNull: false },
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: { isEmail: true },
		},
		password: { type: DataTypes.STRING, allowNull: false },
		role: {
			type: DataTypes.ENUM("client", "coach"),
			defaultValue: "client",
		},
		avatarUrl: { type: DataTypes.STRING, allowNull: true },
		bio: { type: DataTypes.TEXT, allowNull: true },
	});
};

export default UserModel;
