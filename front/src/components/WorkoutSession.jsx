import "./WorkoutSession.scss";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api";
import Spinner from "./Spinner";

const fmt = (n) => (n < 10 ? `0${n}` : `${n}`);

export default function WorkoutSession({ programme, onClose }) {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [full, setFull] = useState(null);

	// chrono
	const [elapsed, setElapsed] = useState(0);
	const startedAtRef = useRef(Date.now());
	const intervalRef = useRef(null);

	// entrées utilisateur par exercice
	const [entries, setEntries] = useState([]);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get(
					`/api/programmes/${programme.id}`
				);
				setFull(data);

				const initial = (data.exercices || []).map((ex) => ({
					exerciceId: ex.id,
					reps: ex?.ProgrammeExercice?.reps || "",
					weightKg: "",
					notes: "",
				}));
				setEntries(initial);
			} finally {
				setLoading(false);
			}
		})();

		// démarrer chrono
		intervalRef.current = setInterval(
			() =>
				setElapsed(
					Math.floor((Date.now() - startedAtRef.current) / 1000)
				),
			1000
		);
		return () => clearInterval(intervalRef.current);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [programme.id]);

	const mmss = useMemo(() => {
		const m = Math.floor(elapsed / 60);
		const s = elapsed % 60;
		return `${fmt(m)}:${fmt(s)}`;
	}, [elapsed]);

	const update = (i, field, value) => {
		setEntries((arr) =>
			arr.map((e, idx) => (idx === i ? { ...e, [field]: value } : e))
		);
	};

	// Construit le champ notes pour le back (pas de champ "reps" côté API)
	const buildNotes = ({ reps, notes }) => {
		const parts = [];
		if (reps && reps.trim()) parts.push(`reps=${reps.trim()}`);
		if (notes && notes.trim()) parts.push(notes.trim());
		return parts.join(" | ") || null;
	};

	const submit = async () => {
		setSaving(true);
		try {
			const durationMin = Math.max(1, Math.round(elapsed / 60));
			const performedAt = new Date(startedAtRef.current).toISOString();

			// 1) entrée "session" (programme + durée)
			const sessionPayload = {
				programmeId: programme.id,
				durationMin,
				performedAt,
				notes: "Session terminée",
			};

			// 2) une entrée par exercice
			const exercisePayloads = entries
				.filter((e) => e.exerciceId)
				.map((e) => ({
					programmeId: programme.id,
					exerciceId: e.exerciceId,
					weightUsed: e.weightKg ? String(e.weightKg) : null, // back attend une string
					notes: buildNotes(e), // on glisse les reps ici
					performedAt,
				}));

			// On envoie tout (la session + chaque exo)
			await Promise.all([
				api.post("/api/history", sessionPayload),
				...exercisePayloads.map((p) => api.post("/api/history", p)),
			]);

			onClose(true); // fermer + refresh stats dans le dashboard
		} catch (e) {
			alert(
				e?.response?.data?.message || "Erreur lors de l’enregistrement"
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div
			className="ws-overlay"
			role="dialog"
			aria-modal="true"
			aria-label="Séance en cours"
		>
			<div className="ws-panel">
				<div className="ws-header">
					<div className="left">
						<h3 className="title">{programme.title}</h3>
						<div className="subtitle">
							{programme.level ? (
								<span className={`badge ${programme.level}`}>
									{programme.level}
								</span>
							) : null}
							{programme.goal ? (
								<span className="badge goal">
									{programme.goal}
								</span>
							) : null}
						</div>
					</div>

					<div className="timer" aria-label="Temps écoulé">
						⏱ {mmss}
					</div>
				</div>

				<div className="ws-body">
					{loading ? (
						<div className="loading">
							<Spinner />
						</div>
					) : !full?.exercices?.length ? (
						<div className="empty">
							Ce programme ne contient pas d’exercices.
						</div>
					) : (
						<div className="ex-list">
							{full.exercices.map((ex, i) => (
								<div key={ex.id} className="ex-item">
									<div className="ex-head">
										<div className="ex-name">
											{ex.name || `Exercice #${ex.id}`}
										</div>
										{ex.ProgrammeExercice?.reps ? (
											<div className="ex-suggest">
												Cible :{" "}
												{ex.ProgrammeExercice.reps}
											</div>
										) : null}
									</div>

									<div className="ex-grid">
										<div className="col">
											<label>Répétitions / format</label>
											<input
												value={entries[i]?.reps || ""}
												onChange={(e) =>
													update(
														i,
														"reps",
														e.target.value
													)
												}
												placeholder="ex: 4x10, AMRAP…"
											/>
										</div>
										<div className="col">
											<label>Poids (kg)</label>
											<input
												type="number"
												step="0.5"
												min="0"
												value={
													entries[i]?.weightKg || ""
												}
												onChange={(e) =>
													update(
														i,
														"weightKg",
														e.target.value
													)
												}
												placeholder="ex: 50"
											/>
										</div>
										<div className="col wide">
											<label>Notes</label>
											<input
												value={entries[i]?.notes || ""}
												onChange={(e) =>
													update(
														i,
														"notes",
														e.target.value
													)
												}
												placeholder="RPE, sensations, ajustements…"
											/>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="ws-footer">
					<button
						className="btn btn-ghost"
						onClick={() => onClose(false)}
						disabled={saving}
					>
						Annuler
					</button>
					<button
						className="btn btn-primary"
						onClick={submit}
						disabled={saving || loading}
					>
						{saving ? <Spinner /> : "Terminer la séance"}
					</button>
				</div>
			</div>

			<button
				className="ws-backdrop"
				aria-label="Fermer"
				onClick={() => onClose(false)}
			/>
		</div>
	);
}
