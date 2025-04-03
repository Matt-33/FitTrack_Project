import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Dashboard.scss";

const Dashboard = () => {
	const { user } = useContext(AuthContext);
	const [workouts, setWorkouts] = useState([]);
	const [newWorkout, setNewWorkout] = useState({ name: "", reps: "" });

	// Simuler une récupération des entraînements (on branchera l’API plus tard)
	useEffect(() => {
		const fakeWorkouts = [
			{ id: 1, name: "Squat", reps: "4x10", date: "2024-03-19" },
			{ id: 2, name: "Pompes", reps: "3x15", date: "2024-03-18" },
		];
		setWorkouts(fakeWorkouts);
	}, []);

	// Ajouter un nouvel entraînement
	const handleAddWorkout = () => {
		if (!newWorkout.name || !newWorkout.reps) return;
		const newEntry = {
			id: Date.now(),
			...newWorkout,
			date: new Date().toISOString().split("T")[0],
		};
		setWorkouts([...workouts, newEntry]);
		setNewWorkout({ name: "", reps: "" });
	};

	return (
		<div className="dashboard">
			<h2>Bienvenue, {user?.name} 👋</h2>

			<div className="add-workout">
				<h3>Ajouter un entraînement</h3>
				<input
					type="text"
					placeholder="Nom de l'exercice"
					value={newWorkout.name}
					onChange={(e) =>
						setNewWorkout({ ...newWorkout, name: e.target.value })
					}
				/>
				<input
					type="text"
					placeholder="Séries x Répétitions"
					value={newWorkout.reps}
					onChange={(e) =>
						setNewWorkout({ ...newWorkout, reps: e.target.value })
					}
				/>
				<button onClick={handleAddWorkout}>Ajouter</button>
			</div>

			<h3>Vos entraînements :</h3>
			<ul>
				{workouts.length > 0 ? (
					workouts.map((workout) => (
						<li key={workout.id}>
							<strong>{workout.name}</strong> - {workout.reps} (
							{workout.date})
						</li>
					))
				) : (
					<p>Aucun entraînement ajouté.</p>
				)}
			</ul>
		</div>
	);
};

export default Dashboard;
