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

	const [exercices, setExercices] = useState([]);
	const [loadingExercices, setLoadingExercices] = useState(true);

	const [rows, setRows] = useState([]);

	const [err, setErr] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get(
					"/api/exercices?page=1&limit=100"
				);
				setExercices(data.data || data || []);
			} catch {
			} finally {
				setLoadingExercices(false);
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
				orderIndex: (r?.length || 0) + 1,
				reps: "",
				restSec: 90,
				createMode: exercices.length === 0,
				newName: "",
				creating: false,
			},
		]);

	const updateRow = (i, field, value) => {
		setRows((r) =>
			r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row))
		);
	};

	const removeRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));

	const toggleCreateMode = (i, on = undefined) => {
		setRows((r) =>
			r.map((row, idx) =>
				idx === i
					? {
							...row,
							createMode: on ?? !row.createMode,
							newName: on ? row.newName : "",
					  }
					: row
			)
		);
	};

	const createExerciceInline = async (i) => {
		const row = rows[i];
		const name = (row.newName || "").trim();
		if (name.length < 2) {
			toast.error("Nom d’exercice trop court (min. 2 caractères).");
			return;
		}
		updateRow(i, "creating", true);
		try {
			const { data } = await api.post("/api/exercices", { name });
			const created = data?.exercice || data;
			if (!created?.id) throw new Error("Création échouée");
			setExercices((list) => [...list, created]);
			setRows((r) =>
				r.map((row, idx) =>
					idx === i
						? {
								...row,
								exerciceId: created.id,
								createMode: false,
								creating: false,
								newName: "",
						  }
						: row
				)
			);
			toast.success(`Exercice « ${created.name} » créé ✅`);
		} catch (e) {
			updateRow(i, "creating", false);
			toast.error(
				e?.response?.data?.message || "Impossible de créer l’exercice"
			);
		}
	};

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
				exercices: rows
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

				{/* EXERCICES */}
				<div className="exercises-block">
					{rows.length === 0 && (
						<div className="empty-ex">
							{loadingExercices ? (
								<span>Chargement des exercices…</span>
							) : exercices.length === 0 ? (
								<span>
									Aucun exercice existant. Crée-en un 👇
								</span>
							) : (
								<span>Ajoute ta première ligne 👇</span>
							)}
						</div>
					)}

					{rows.length > 0 && (
						<div className="exercise-list">
							{rows.map((row, i) => (
								<div key={i} className="exercise-row">
									{!row.createMode ? (
										<>
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
												{exercices.map((ex) => (
													<option
														key={ex.id}
														value={ex.id}
													>
														{ex.name}
													</option>
												))}
											</select>

											<button
												type="button"
												className="btn btn-ghost small"
												onClick={() =>
													toggleCreateMode(i, true)
												}
												title="Créer un nouvel exercice"
											>
												Nouveau
											</button>
										</>
									) : (
										<div className="new-ex">
											<input
												placeholder="Nom du nouvel exercice"
												value={row.newName}
												onChange={(e) =>
													updateRow(
														i,
														"newName",
														e.target.value
													)
												}
											/>
											<button
												type="button"
												className="btn btn-outline small"
												onClick={() =>
													createExerciceInline(i)
												}
												disabled={row.creating}
											>
												{row.creating ? (
													<Spinner />
												) : (
													"Créer & sélectionner"
												)}
											</button>
											<button
												type="button"
												className="btn btn-ghost small"
												onClick={() =>
													toggleCreateMode(i, false)
												}
												disabled={row.creating}
											>
												Annuler
											</button>
										</div>
									)}

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
											updateRow(i, "reps", e.target.value)
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
