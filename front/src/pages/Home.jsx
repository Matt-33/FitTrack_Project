import "./Home.scss";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
	const { user } = useContext(AuthContext);
	const navigate = useNavigate();

	const goStart = () => navigate(user ? "/dashboard" : "/login");
	const goPrograms = () => navigate("/programs");
	const goDashboard = () => navigate("/dashboard");

	return (
		<div className="home-page">
			{/* HERO */}
			<section className="home-hero">
				<div className="hero-inner">
					<h1>Repousse tes limites.</h1>
					<p className="sub">
						Des programmes adaptés à ton niveau, un suivi clair, des
						objectifs atteignables.
					</p>
					<div className="cta-row">
						<button className="btn btn-primary" onClick={goStart}>
							{user ? "Aller au dashboard" : "Commencer"}
						</button>
						<button
							className="btn btn-outline"
							onClick={goPrograms}
						>
							Découvrir les programmes
						</button>
						{user && (
							<button
								className="btn btn-ghost"
								onClick={goDashboard}
							>
								Mon suivi
							</button>
						)}
					</div>
				</div>
			</section>

			{/* METRICS */}
			<section className="metrics">
				<div className="metric">
					<div className="value">150+</div>
					<div className="label">Exercices</div>
				</div>
				<div className="metric">
					<div className="value">30+</div>
					<div className="label">Programmes</div>
				</div>
				<div className="metric">
					<div className="value">10k</div>
					<div className="label">Séances complétées</div>
				</div>
				<div className="metric">
					<div className="value">4.9★</div>
					<div className="label">Satisfaction</div>
				</div>
			</section>

			{/* FEATURES */}
			<section className="features">
				<div className="grid">
					<article className="card">
						<div className="icon">🎯</div>
						<h3>Objectifs clairs</h3>
						<p>
							Force, hypertrophie, endurance ou perte de poids —
							choisis ton focus.
						</p>
					</article>
					<article className="card">
						<div className="icon">📊</div>
						<h3>Suivi visuel</h3>
						<p>
							Vois tes progrès semaine après semaine grâce aux
							stats synthétiques.
						</p>
					</article>
					<article className="card">
						<div className="icon">🧭</div>
						<h3>Guides structurés</h3>
						<p>
							Chaque programme est ordonné, avec séries, repos et
							conseils.
						</p>
					</article>
					<article className="card">
						<div className="icon">🤝</div>
						<h3>Coach & communauté</h3>
						<p>
							Accède aux plans des coachs et partage tes
							performances.
						</p>
					</article>
					<article className="card">
						<div className="icon">⚡</div>
						<h3>Rapide & simple</h3>
						<p>
							Inscris-toi, choisis un plan, lance ta première
							séance en 2 minutes.
						</p>
					</article>
					<article className="card">
						<div className="icon">🔒</div>
						<h3>Sécurisé</h3>
						<p>
							Ton compte et tes données sont protégés par
							authentification JWT.
						</p>
					</article>
				</div>
			</section>

			{/* HOW IT WORKS */}
			<section className="how">
				<h2>Comment ça marche ?</h2>
				<div className="steps">
					<div className="step">
						<div className="num">1</div>
						<h4>Crée ton compte</h4>
						<p>En quelques clics, sans friction.</p>
					</div>
					<div className="step">
						<div className="num">2</div>
						<h4>Choisis un programme</h4>
						<p>Filtre par niveau et objectif.</p>
					</div>
					<div className="step">
						<div className="num">3</div>
						<h4>Entraîne-toi & progresse</h4>
						<p>Log tes séances et suis tes stats.</p>
					</div>
				</div>
			</section>

			{/* CTA FINAL */}
			<section className="cta-final">
				<div className="cta-card">
					<h3>Prêt à t’y mettre ?</h3>
					<p>Rejoins FitTrack et commence aujourd’hui.</p>
					<div className="cta-actions">
						<button className="btn btn-primary" onClick={goStart}>
							{user ? "Ouvrir le dashboard" : "Créer mon compte"}
						</button>
						<button
							className="btn btn-outline"
							onClick={goPrograms}
						>
							Parcourir les programmes
						</button>
					</div>
				</div>
			</section>

			<footer className="home-footer">
				<p>
					© {new Date().getFullYear()} FitTrack •{" "}
					<a href="#">Mentions légales</a>
				</p>
			</footer>
		</div>
	);
};

export default Home;
