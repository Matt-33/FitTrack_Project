import { useState } from "react";
import "./CreateProgram.scss";

const CreateProgram = () => {
	const [title, setTitle] = useState("");
	const [goal, setGoal] = useState("prise de masse");
	const [exercises, setExercises] = useState([
		{ name: "", reps: "", weight: "", duration: "" },
	]);

	const handleExerciseChange = (index, field, value) => {
		const updated = [...exercises];
		updated[index][field] = value;
		setExercises(updated);
	};

	const addExercise = () => {
		setExercises([
			...exercises,
			{ name: "", reps: "", weight: "", duration: "" },
		]);
	};

	const removeExercise = (index) => {
		setExercises(exercises.filter((_, i) => i !== index));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const program = { title, goal, exercises };

		// Pour l’instant on logge seulement
		console.log("Programme créé :", program);

		// Réinitialisation
		setTitle("");
		setGoal("prise de masse");
		setExercises([{ name: "", reps: "", weight: "", duration: "" }]);

		alert("Programme créé !");
	};

	return (
		<div className="create-program">
			<h2>Créer un programme</h2>
			<form onSubmit={handleSubmit}>
				<label>Titre :</label>
				<input
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>

				<label>Objectif :</label>
				<select value={goal} onChange={(e) => setGoal(e.target.value)}>
					<option value="prise de masse">Prise de masse</option>
					<option value="sèche">Sèche</option>
					<option value="endurance">Endurance</option>
				</select>

				<h3>Exercices :</h3>
				{exercises.map((ex, index) => (
					<div key={index} className="exercise">
						<input
							type="text"
							placeholder="Nom"
							value={ex.name}
							onChange={(e) =>
								handleExerciseChange(
									index,
									"name",
									e.target.value
								)
							}
							required
						/>
						<input
							type="text"
							placeholder="Reps"
							value={ex.reps}
							onChange={(e) =>
								handleExerciseChange(
									index,
									"reps",
									e.target.value
								)
							}
						/>
						<input
							type="text"
							placeholder="Poids"
							value={ex.weight}
							onChange={(e) =>
								handleExerciseChange(
									index,
									"weight",
									e.target.value
								)
							}
						/>
						<input
							type="text"
							placeholder="Durée"
							value={ex.duration}
							onChange={(e) =>
								handleExerciseChange(
									index,
									"duration",
									e.target.value
								)
							}
						/>
						<button
							type="button"
							onClick={() => removeExercise(index)}
						>
							Supprimer
						</button>
					</div>
				))}

				<button type="button" onClick={addExercise}>
					+ Ajouter un exercice
				</button>

				<button type="submit">Créer le programme</button>
			</form>
		</div>
	);
};

export default CreateProgram;
