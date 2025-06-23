import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "./AccountSettings.scss";

const AccountSettings = () => {
	const { user, dispatch } = useContext(AuthContext);

	// Valeurs initiales basées sur le contexte
	const [name, setName] = useState(user?.name || "");
	const [role, setRole] = useState(user?.role || "client");

	const handleSubmit = (e) => {
		e.preventDefault();

		const updatedUser = {
			...user,
			name,
			role,
		};

		// Simule une MAJ (plus tard -> API + re-login si besoin)
		localStorage.setItem("user", JSON.stringify(updatedUser));
		dispatch({
			type: "LOGIN",
			payload: {
				user: updatedUser,
				token: localStorage.getItem("token"),
			},
		});

		alert("Modifications enregistrées !");
	};

	return (
		<div className="account-settings">
			<h2>Paramètres de mon compte</h2>
			<form onSubmit={handleSubmit}>
				<label>Nom :</label>
				<input
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>

				<label>Rôle :</label>
				<select value={role} onChange={(e) => setRole(e.target.value)}>
					<option value="client">Client</option>
					<option value="coach">Coach</option>
				</select>

				<button type="submit">Enregistrer</button>
			</form>
		</div>
	);
};

export default AccountSettings;
