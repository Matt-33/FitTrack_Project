import "./Login.scss";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import Spinner from "../components/Spinner";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const { login, register } = useContext(AuthContext);
	const { toast } = useToast();
	const navigate = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await login(email, password);
			toast.success("Bienvenue 👋");
			navigate("/dashboard");
		} catch (e) {
			toast.error(e?.response?.data?.message || "Erreur de connexion");
		} finally {
			setLoading(false);
		}
	};

	const handleRegister = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await register("Utilisateur", email, password);
			toast.success("Compte créé ✅");
			navigate("/dashboard");
		} catch (e) {
			toast.error(e?.response?.data?.message || "Erreur à l'inscription");
		} finally {
			setLoading(false);
		}
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
				<button type="submit" disabled={loading}>
					{loading ? <Spinner /> : "Se connecter"}
				</button>
				<button
					type="button"
					onClick={handleRegister}
					disabled={loading}
					style={{ marginTop: 8 }}
				>
					{loading ? <Spinner /> : "S'inscrire (rapide)"}
				</button>
			</form>
		</div>
	);
};

export default Login;
