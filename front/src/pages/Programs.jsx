import { useEffect, useState, useContext, useMemo } from "react";
import "./Programs.scss";
import { api } from "../lib/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import Spinner from "../components/Spinner";

const LEVEL_LABELS = {
	debutant: "Débutant",
	intermediaire: "Intermédiaire",
	avance: "Avancé",
};

const GOAL_LABELS = {
	hypertrophie: "Hypertrophie",
	force: "Force",
	endurance: "Endurance",
	perte_de_poids: "Perte de poids",
};

const SkeletonCard = () => (
	<div className="program-card skeleton">
		<div className="sk-title" />
		<div className="sk-row" />
		<div className="sk-row" />
		<div className="sk-footer" />
	</div>
);

const Programs = () => {
	const [programs, setPrograms] = useState([]);
	const [loading, setLoading] = useState(true);

	const [enrolling, setEnrolling] = useState({});
	const [enrolledIds, setEnrolledIds] = useState(() => new Set());

	const { token } = useContext(AuthContext);
	const { toast } = useToast();
	const navigate = useNavigate();

	// Filtres
	const [q, setQ] = useState("");
	const [level, setLevel] = useState("");
	const [goal, setGoal] = useState("");

	const queryString = useMemo(() => {
		const params = new URLSearchParams();
		params.set("page", "1");
		params.set("limit", "20");
		if (q) params.set("q", q);
		if (level) params.set("level", level);
		if (goal) params.set("goal", goal);
		return params.toString();
	}, [q, level, goal]);

	const load = async () => {
		setLoading(true);
		try {
			const [progsRes, mineRes] = await Promise.all([
				api.get(`/api/programmes?${queryString}`),
				token
					? api.get("/api/enrollments/mine")
					: Promise.resolve({ data: [] }),
			]);

			const list = progsRes.data.data || progsRes.data || [];
			setPrograms(list);

			const mine = mineRes.data || [];
			const ids = new Set(
				mine
					.map((r) =>
						typeof r?.id === "number" ? r.id : r?.programmeId
					)
					.filter(Boolean)
			);
			setEnrolledIds(ids);
		} catch (e) {
			toast.error("Erreur de chargement des programmes");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [queryString, token]);

	const enroll = async (programmeId) => {
		if (!token) return navigate("/login");
		setEnrolling((p) => ({ ...p, [programmeId]: true }));
		try {
			await api.post("/api/enrollments", { programmeId });
			// Marquer comme inscrit dans l'état local
			setEnrolledIds((prev) => {
				const next = new Set(prev);
				next.add(programmeId);
				return next;
			});
			toast.success("Inscription réussie 🎯");
		} catch (e) {
			toast.error(
				e?.response?.data?.message || "Erreur lors de l'inscription"
			);
		} finally {
			setEnrolling((p) => ({ ...p, [programmeId]: false }));
		}
	};

	const resetFilters = () => {
		setQ("");
		setLevel("");
		setGoal("");
	};

	return (
		<div className="programs-page">
			{/* Hero */}
			<section className="hero">
				<div className="hero__content">
					<h1>Programmes</h1>
					<p>
						Choisis un plan qui correspond à ton niveau et ton
						objectif.
					</p>
				</div>
			</section>

			{/* Filtres */}
			<section className="filters">
				<input
					type="search"
					placeholder="Rechercher un programme…"
					value={q}
					onChange={(e) => setQ(e.target.value)}
				/>
				<select
					value={level}
					onChange={(e) => setLevel(e.target.value)}
				>
					<option value="">Tous les niveaux</option>
					<option value="debutant">Débutant</option>
					<option value="intermediaire">Intermédiaire</option>
					<option value="avance">Avancé</option>
				</select>
				<select value={goal} onChange={(e) => setGoal(e.target.value)}>
					<option value="">Tous les objectifs</option>
					<option value="hypertrophie">Hypertrophie</option>
					<option value="force">Force</option>
					<option value="endurance">Endurance</option>
					<option value="perte_de_poids">Perte de poids</option>
				</select>
				<button className="btn btn-ghost" onClick={resetFilters}>
					Réinitialiser
				</button>
			</section>

			{/* Liste */}
			<section className="programs">
				{loading ? (
					<div className="grid">
						{Array.from({ length: 6 }).map((_, i) => (
							<SkeletonCard key={i} />
						))}
					</div>
				) : programs.length === 0 ? (
					<div className="empty">
						Aucun programme trouvé. Essaie d’ajuster tes filtres.
					</div>
				) : (
					<div className="grid">
						{programs.map((p) => {
							const isEnrolled = enrolledIds.has(p.id);
							return (
								<article className="program-card" key={p.id}>
									<div className="card-top">
										<h3 className="title">{p.title}</h3>
										<div className="badges">
											{p.level && (
												<span
													className={`badge badge-level ${p.level}`}
												>
													{LEVEL_LABELS[p.level] ||
														p.level}
												</span>
											)}
											{p.goal && (
												<span className="badge badge-goal">
													{GOAL_LABELS[p.goal] ||
														p.goal}
												</span>
											)}
										</div>
									</div>

									{p.description && (
										<p className="desc">{p.description}</p>
									)}

									<div className="footer">
										<div className="coach">
											<div className="avatar">
												{(p.coach?.name || "C")
													.split(" ")
													.map((s) => s[0])
													.slice(0, 2)
													.join("")
													.toUpperCase()}
											</div>
											<span className="coach-name">
												{p.coach?.name || "Coach"}
											</span>
										</div>

										<button
											className={`btn btn-primary ${
												isEnrolled ? "btn-success" : ""
											}`}
											onClick={() =>
												isEnrolled
													? navigate("/dashboard")
													: enroll(p.id)
											}
											disabled={!!enrolling[p.id]}
											title={
												isEnrolled
													? "Déjà inscrit"
													: "S'inscrire"
											}
										>
											{enrolling[p.id] ? (
												<Spinner />
											) : isEnrolled ? (
												"Inscrit ✓"
											) : (
												"S'inscrire"
											)}
										</button>
									</div>
								</article>
							);
						})}
					</div>
				)}
			</section>
		</div>
	);
};

export default Programs;
