import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Dashboard.scss";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

function initials(name = "") {
	return (
		name
			.trim()
			.split(" ")
			.map((s) => s[0])
			.slice(0, 2)
			.join("")
			.toUpperCase() || "U"
	);
}

const SkeletonCard = () => (
	<div className="dash-card skeleton">
		<div className="sk-title" />
		<div className="sk-row" />
		<div className="sk-row" />
	</div>
);

const Dashboard = () => {
	const { user, token } = useContext(AuthContext);
	const navigate = useNavigate();

	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState(null);
	const [myProgs, setMyProgs] = useState([]);
	const [recent, setRecent] = useState([]);

	useEffect(() => {
		if (!token) return;
		(async () => {
			setLoading(true);
			try {
				const [s, p] = await Promise.allSettled([
					api.get("/api/stats/me"),
					api.get("/api/enrollments/mine"),
				]);
				if (s.status === "fulfilled") setStats(s.value.data);
				if (p.status === "fulfilled") setMyProgs(p.value.data || []);
				// Optionnel: si tu ajoutes une route /api/history/mine, branche ici:
				// const h = await api.get("/api/history/mine?limit=10"); setRecent(h.data);
			} finally {
				setLoading(false);
			}
		})();
	}, [token]);

	const sessionsTotal = stats?.totals?.sessions ?? 0;
	const durationTotalMin = stats?.totals?.durationMin ?? 0;

	// Progression hebdo: objectif WHO 150 min/semaine (fallback si pas de cible côté API)
	const weekMinutes =
		stats?.thisWeek?.durationMin ?? stats?.weekly?.durationMin ?? 0;
	const weekTarget = stats?.targets?.weekDurationMin ?? 150;
	const progress = Math.max(
		0,
		Math.min(100, Math.round((weekMinutes / Math.max(weekTarget, 1)) * 100))
	);

	const coachMode = user?.role === "coach";

	const goPrograms = () => navigate("/programs");
	const goCreate = () => navigate("/create-program");

	const featured = useMemo(() => (myProgs || []).slice(0, 3), [myProgs]);

	if (!user) {
		return (
			<div className="dashboard-page no-user">
				<div className="gate">
					<h2>Veuillez vous connecter.</h2>
					<button
						className="btn btn-primary"
						onClick={() => navigate("/login")}
					>
						Se connecter
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="dashboard-page">
			{/* TOP / HERO */}
			<section className="dash-hero">
				<div className="hero-inner">
					<div className="user">
						<div className="avatar">{initials(user.name)}</div>
						<div className="info">
							<h2>Hey {user.name} 👋</h2>
							<p>Prêt pour ta prochaine séance ?</p>
						</div>
					</div>

					<div className="actions">
						<button
							className="btn btn-primary"
							onClick={goPrograms}
						>
							Commencer une séance
						</button>
						{coachMode && (
							<button
								className="btn btn-outline"
								onClick={goCreate}
							>
								Créer un programme
							</button>
						)}
					</div>
				</div>
			</section>

			{/* STATS */}
			<section className="stats-grid">
				{loading ? (
					<>
						<SkeletonCard />
						<SkeletonCard />
						<SkeletonCard />
					</>
				) : (
					<>
						<div className="dash-card kpi">
							<div className="kpi-title">Séances totales</div>
							<div className="kpi-value">{sessionsTotal}</div>
							<div className="kpi-sub">Depuis le début</div>
						</div>

						<div className="dash-card kpi">
							<div className="kpi-title">Durée totale</div>
							<div className="kpi-value">
								{Math.floor(durationTotalMin / 60)}h{" "}
								{durationTotalMin % 60}m
							</div>
							<div className="kpi-sub">Cumulé</div>
						</div>

						<div className="dash-card progress">
							<div
								className="progress-ring"
								style={{ ["--p"]: `${progress}%` }}
							>
								<svg viewBox="0 0 36 36" className="ring">
									<path
										className="bg"
										d="M18 2.0845
                       a 15.9155 15.9155 0 0 1 0 31.831
                       a 15.9155 15.9155 0 0 1 0 -31.831"
									/>
									<path
										className="meter"
										strokeDasharray={`${progress}, 100`}
										d="M18 2.0845
                       a 15.9155 15.9155 0 0 1 0 31.831
                       a 15.9155 15.9155 0 0 1 0 -31.831"
									/>
									<text x="18" y="20.35" className="label">
										{progress}%
									</text>
								</svg>
							</div>
							<div className="progress-info">
								<div className="label">Objectif hebdo</div>
								<div className="desc">
									{weekMinutes} / {weekTarget} min cette
									semaine
								</div>
							</div>
						</div>
					</>
				)}
			</section>

			{/* MES PROGRAMMES */}
			<section className="my-programs">
				<div className="section-top">
					<h3>Mes programmes</h3>
					<button className="btn btn-ghost" onClick={goPrograms}>
						Voir tous les programmes
					</button>
				</div>

				{loading ? (
					<div className="grid">
						<SkeletonCard />
						<SkeletonCard />
						<SkeletonCard />
					</div>
				) : !myProgs?.length ? (
					<div className="empty">
						Tu n’es inscrit à aucun programme. Parcours la
						bibliothèque pour commencer.
						<div>
							<button
								className="btn btn-primary"
								onClick={goPrograms}
							>
								Explorer les programmes
							</button>
						</div>
					</div>
				) : (
					<div className="grid">
						{featured.map((p) => (
							<article
								className="dash-card program-card"
								key={p.id}
							>
								<div className="top">
									<h4 className="title">{p.title}</h4>
									{p.level && (
										<span className={`badge ${p.level}`}>
											{p.level}
										</span>
									)}
								</div>
								{p.description && (
									<p className="desc">{p.description}</p>
								)}
								<div className="bottom">
									<div className="coach">
										<div className="av">
											{initials(p.coach?.name || "C")}
										</div>
										<span>{p.coach?.name || "Coach"}</span>
									</div>
									<button
										className="btn btn-outline"
										onClick={goPrograms}
									>
										Continuer
									</button>
								</div>
							</article>
						))}
					</div>
				)}
			</section>

			{/* DERNIÈRES ACTIVITÉS (fallback si pas de route) */}
			<section className="recent">
				<h3>Dernières activités</h3>
				{loading ? (
					<div className="list-skeleton">
						<div className="row" />
						<div className="row" />
						<div className="row" />
					</div>
				) : recent.length ? (
					<ul className="history">
						{recent.map((r, i) => (
							<li key={i}>
								<span className="when">
									{new Date(r.createdAt).toLocaleString()}
								</span>
								<span className="txt">
									{r.title || r.exercice?.name || "Séance"} —{" "}
									{r.reps || r.durationMin || ""}
								</span>
							</li>
						))}
					</ul>
				) : (
					<div className="empty small">
						Aucune activité récente à afficher.
					</div>
				)}
			</section>
		</div>
	);
};

export default Dashboard;
