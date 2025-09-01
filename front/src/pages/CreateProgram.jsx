import { useContext, useEffect, useState } from "react";
import "./CreateProgram.scss";
import { AuthContext } from "../context/AuthContext";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import Spinner from "../components/Spinner";

const CreateProgram = () => {
	const { user } = useContext(AuthContext);
	const navigate = useNavigate();
	const { toast } = useToast();

	const [title, setTitle] = useState("");
	const [level, setLevel] = useState("debutant");
	const [goal, setGoal] = useState("hypertrophie");
	const [description, setDescription] = useState("");
	const [isPublished, setIsPublished] = useState(true);

	const [exercises, setExercises] = useState([]);
	const [loadingExercises, setLoadingExercises] = useState(true);
	// 👉 aucune ligne par défaut
	const [rows, setRows] = useState([]);

	const [err, setErr] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get(
					"/api/exercises?page=1&limit=100"
				);
				setExercises(data.data || data);
			} catch {
				// pas bloquant : la création du programme ne dépend pas des exercices
			} finally {
				setLoadingExercises(false);
			}
		})();
	}, []);

	if (!user || user.role !== "coach") {
		return (
			<div className="create-program restricted">
				Accès réservé aux coachs.
			</div>
		);
	}

	const addRow = () =>
		setRows((r) => [
			...r,
			{
				exerciceId: null,
				orderIndex: r.length + 1,
				reps: "",
				restSec: 90,
			},
		]);

	const updateRow = (i, field, value) => {
		setRows((r) =>
			r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row))
		);
	};

	const removeRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));

	const submit = async (e) => {
		e.preventDefault();
		setErr("");
		setSubmitting(true);
		try {
			const payload = {
				title,
				level,
				goal,
				description,
				isPublished,
				// 👉 si tu n’ajoutes pas d’exercices, on envoie un tableau vide
				exercises: rows
					.filter((r) => r.exerciceId)
					.map(({ exerciceId, orderIndex, reps, restSec }) => ({
						exerciceId,
						orderIndex: Number(orderIndex || 1),
						reps,
						restSec: Number(restSec || 0),
					})),
			};
			await api.post("/api/programmes", payload);
			toast.success("Programme créé ✅");
			navigate("/programs");
		} catch (e) {
			const msg =
				e?.response?.data?.message || "Erreur lors de la création";
			setErr(msg);
			toast.error(msg);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="create-program">
			<h2>Créer un programme</h2>
			{!!err && <p className="form-error">{err}</p>}

			<form onSubmit={submit} className="form">
				<div className="form-row">
					<label htmlFor="title">Titre</label>
					<input
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
					/>
				</div>

				<div className="form-row two-cols">
					<div>
						<label htmlFor="level">Niveau</label>
						<select
							id="level"
							value={level}
							onChange={(e) => setLevel(e.target.value)}
						>
							<option value="debutant">Débutant</option>
							<option value="intermediaire">Intermédiaire</option>
							<option value="avance">Avancé</option>
						</select>
					</div>

					<div>
						<label htmlFor="goal">Objectif</label>
						<select
							id="goal"
							value={goal}
							onChange={(e) => setGoal(e.target.value)}
						>
							<option value="hypertrophie">Hypertrophie</option>
							<option value="force">Force</option>
							<option value="endurance">Endurance</option>
							<option value="perte_de_poids">
								Perte de poids
							</option>
						</select>
					</div>
				</div>

				<div className="form-row">
					<label htmlFor="description">Description</label>
					<textarea
						id="description"
						rows={4}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</div>

				<label className="checkbox">
					<input
						type="checkbox"
						checked={isPublished}
						onChange={(e) => setIsPublished(e.target.checked)}
					/>
					Publier
				</label>

				{/* 👉 Section exercices épurée, sans header ni titre */}
				{(rows.length > 0 || !loadingExercises) && (
					<div className="exercises-block">
						{rows.length > 0 && (
							<div className="exercise-list">
								{rows.map((row, i) => (
									<div key={i} className="exercise-row">
										<select
											value={row.exerciceId || ""}
											onChange={(e) =>
												updateRow(
													i,
													"exerciceId",
													Number(e.target.value)
												)
											}
										>
											<option value="" disabled>
												— Sélectionner un exercice —
											</option>
											{exercises.map((ex) => (
												<option
													key={ex.id}
													value={ex.id}
												>
													{ex.name}
												</option>
											))}
										</select>

										<input
											type="number"
											min="1"
											value={row.orderIndex}
											onChange={(e) =>
												updateRow(
													i,
													"orderIndex",
													e.target.value
												)
											}
											placeholder="Ordre"
										/>
										<input
											value={row.reps}
											onChange={(e) =>
												updateRow(
													i,
													"reps",
													e.target.value
												)
											}
											placeholder="Reps ex: 4x10"
										/>
										<input
											type="number"
											min="0"
											value={row.restSec}
											onChange={(e) =>
												updateRow(
													i,
													"restSec",
													e.target.value
												)
											}
											placeholder="Repos (s)"
										/>

										<button
											type="button"
											className="btn btn-ghost"
											onClick={() => removeRow(i)}
										>
											Suppr
										</button>
									</div>
								))}
							</div>
						)}

						{/* Bouton discret en bas uniquement */}
						<div className="add-row">
							<button
								type="button"
								className="btn btn-link"
								onClick={addRow}
							>
								+ Ajouter un exercice
							</button>
						</div>
					</div>
				)}

				<div className="actions">
					<button
						type="submit"
						className="btn btn-primary"
						disabled={submitting}
					>
						{submitting ? <Spinner /> : "Créer le programme"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default CreateProgram;
