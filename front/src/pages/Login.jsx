import "./Login.scss";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { dispatch } = useContext(AuthContext);
	const navigate = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();

		const fakeUser = { id: 1, name: "Matthias", email, role: "client" };
		const fakeToken = "123456abcdef";

		dispatch({
			type: "LOGIN",
			payload: { user: fakeUser, token: fakeToken },
		});
		navigate("/dashboard");
	};

	return (
		<div className="login-page">
			<form onSubmit={handleLogin}>
				<h2>Connexion</h2>
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<input
					type="password"
					placeholder="Mot de passe"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				<button type="submit">Se connecter</button>
			</form>
		</div>
	);
};

export default Login;
