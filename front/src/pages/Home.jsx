import "./Home.scss";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
	const { user } = useContext(AuthContext);
	const navigate = useNavigate();

	const handleStart = () => {
		navigate(user ? "/dashboard" : "/login");
	};

	const goToPrograms = () => {
		navigate("/programs");
	};

	const goToDashboard = () => {
		navigate("/dashboard");
	};

	return (
		<div className="home">
			<section className="hero">
				<h1 className="title">Repousse tes limites !</h1>
				<p className="subtitle">
					Entraîne-toi comme jamais avec notre app.
				</p>
				<div className="home-buttons">
					<button className="cta" onClick={handleStart}>
						Commencer
					</button>
					<button className="cta secondary" onClick={goToPrograms}>
						Découvrir les programmes
					</button>
					{user && (
						<button
							className="cta secondary"
							onClick={goToDashboard}
						>
							Mon suivi
						</button>
					)}
				</div>
			</section>

			<section className="features">
				<div className="feature">🔥 Programmes personnalisés</div>
				<div className="feature">💪 Coaching en ligne</div>
				<div className="feature">📊 Suivi de progression</div>
				<div className="feature">🎯 Objectifs adaptés</div>
			</section>

			<footer className="footer">
				<p>
					© 2024 FitTrack | <a href="#">Mentions légales</a>
				</p>
			</footer>
		</div>
	);
};

export default Home;
