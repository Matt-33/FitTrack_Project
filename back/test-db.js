import { sequelize } from "./config/db.js";

const testConnection = async () => {
	try {
		await sequelize.authenticate();
		console.log("✅ Connexion à la base de données réussie !");
	} catch (error) {
		console.error("❌ Erreur de connexion à la base :", error.message);
	}
};

testConnection();
