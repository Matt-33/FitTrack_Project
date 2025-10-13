import "./Login.scss";
import { useState, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import Spinner from "../components/Spinner";

// Évalue la force du mot de passe (0..4) + suggestions
function evaluateStrength(pwd, email = "") {
	const suggestions = [];
	const lower = /[a-z]/.test(pwd);
	const upper = /[A-Z]/.test(pwd);
	const digit = /\d/.test(pwd);
	const symbol = /[^A-Za-z0-9]/.test(pwd);

	// Longueur
	let lenScore = 0;
	if (pwd.length >= 8) lenScore = 1;
	if (pwd.length >= 12) lenScore = 2;
	if (pwd.length >= 16) lenScore = 3;

	// Variété
	const types = [lower, upper, digit, symbol].filter(Boolean).length;
	let varScore = 0;
	if (types === 2) varScore = 1;
	if (types === 3) varScore = 2;
	if (types === 4) varScore = 3;

	// Pénalités
	let penalty = 0;
	const local = (email || "").split("@")[0] || "";
	const common = /(password|motdepasse|qwerty|azerty|12345|abcdef)/i.test(
		pwd
	);
	const repeats = /(.)\1{2,}/.test(pwd); // aaa, 111, ...

	if (common) penalty++;
	if (repeats) penalty++;
	if (local.length >= 3 && pwd.toLowerCase().includes(local.toLowerCase()))
		penalty++;

	let score = Math.max(0, Math.min(4, lenScore + varScore - penalty));

	// Suggestions (affichées surtout en inscription)
	if (pwd.length < 12) suggestions.push("Utilise au moins 12 caractères");
	if (types < 3)
		suggestions.push("Mixe minuscules/MAJUSCULES/chiffres/symboles");
	if (repeats) suggestions.push("Évite les répétitions (ex: aaa, 111)");
	if (common) suggestions.push("Évite les mots de passe trop communs");
	if (local.length >= 3 && pwd.toLowerCase().includes(local.toLowerCase()))
		suggestions.push("N’utilise pas ton email/nom dans le mot de passe");

	const label = ["Très faible", "Faible", "Moyen", "Fort", "Excellent"][
		score
	];

	return { score, label, suggestions };
}

const Login = () => {
	const [mode, setMode] = useState("login");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPwd, setShowPwd] = useState(false);
	const [loading, setLoading] = useState(false);

	const { login, register } = useContext(AuthContext);
	const { toast } = useToast();
	const navigate = useNavigate();

	const strength = useMemo(
		() => evaluateStrength(password, email),
		[password, email]
	);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			if (mode === "login") {
				await login(email, password);
				toast.success("Bienvenue 👋");
			} else {
				if (!name || name.trim().length < 2) {
					toast.error(
						"Choisis un nom d’utilisateur (min. 2 caractères)."
					);
					setLoading(false);
					return;
				}
				await register(name.trim(), email, password);
				toast.success("Compte créé ✅");
			}
			navigate("/dashboard");
		} catch (e) {
			toast.error(
				e?.response?.data?.message ||
					(mode === "login"
						? "Erreur de connexion"
						: "Erreur à l'inscription")
			);
		} finally {
			setLoading(false);
		}
	};

	const switchTo = (m) => {
		setMode(m);
		if (m === "login") setName("");
	};

	return (
		<div className="login-page">
			<div className="auth-card">
				{/* Onglets */}
				<div className="tabs" role="tablist" aria-label="Choix du mode">
					<button
						className={`tab ${mode === "login" ? "active" : ""}`}
						role="tab"
						aria-selected={mode === "login"}
						onClick={() => switchTo("login")}
					>
						Connexion
					</button>
					<button
						className={`tab ${mode === "register" ? "active" : ""}`}
						role="tab"
						aria-selected={mode === "register"}
						onClick={() => switchTo("register")}
					>
						Créer un compte
					</button>
				</div>

				<form onSubmit={handleSubmit} className="form">
					{mode === "register" && (
						<div className="row">
							<label htmlFor="name">Nom d’utilisateur</label>
							<input
								id="name"
								autoComplete="nickname"
								placeholder="Ex: Matt33"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								minLength={2}
							/>
							<p className="hint">
								Ce nom correspond au champ <strong>name</strong>{" "}
								en base.
							</p>
						</div>
					)}

					<div className="row">
						<label htmlFor="email">Email</label>
						<input
							id="email"
							type="email"
							autoComplete="email"
							placeholder="ton@email.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<div className="row">
						<label htmlFor="password">Mot de passe</label>
						<div className="password-field">
							<input
								id="password"
								type={showPwd ? "text" : "password"}
								autoComplete={
									mode === "login"
										? "current-password"
										: "new-password"
								}
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								minLength={6}
								aria-describedby="pw-strength-text"
							/>
							<button
								type="button"
								className="reveal"
								aria-label={
									showPwd
										? "Masquer le mot de passe"
										: "Afficher le mot de passe"
								}
								onClick={() => setShowPwd((s) => !s)}
							>
								{showPwd ? "🙈" : "👁️"}
							</button>
						</div>

						{/* Indicateur de force */}
						<div
							className={`pw-meter s${strength.score}`}
							style={{ ["--pw"]: strength.score }}
						>
							<div className="track">
								<div className="fill" />
							</div>
							<div
								id="pw-strength-text"
								className="pw-label"
								role="status"
								aria-live="polite"
							>
								Force du mot de passe :{" "}
								<strong>{strength.label}</strong>
							</div>
						</div>

						{mode === "register" && strength.score < 3 && (
							<ul className="pw-tips">
								{strength.suggestions.map((s, i) => (
									<li key={i}>{s}</li>
								))}
							</ul>
						)}
					</div>

					<div className="actions">
						<button
							type="submit"
							className="btn btn-primary"
							disabled={loading}
						>
							{loading ? (
								<Spinner />
							) : mode === "login" ? (
								"Se connecter"
							) : (
								"Créer mon compte"
							)}
						</button>

						<button
							type="button"
							className="btn btn-ghost"
							onClick={() =>
								switchTo(
									mode === "login" ? "register" : "login"
								)
							}
							disabled={loading}
						>
							{mode === "login"
								? "Je n'ai pas de compte"
								: "J’ai déjà un compte"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Login;
