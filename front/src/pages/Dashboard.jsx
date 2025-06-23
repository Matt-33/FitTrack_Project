import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Dashboard.scss";

const Dashboard = () => {
	const { user } = useContext(AuthContext);

	const [workouts, setWorkouts] = useState([]);
	const [programs, setPrograms] = useState([]);
	const [selectedProgram, setSelectedProgram] = useState(null);
	const [programData, setProgramData] = useState({});

	useEffect(() => {
		// ⚙️ Simule des programmes disponibles
		const fakePrograms = [
			{
				id: 1,
				title: "Full Body Débutant",
				exercises: [
					{ name: "Squat" },
					{ name: "Pompes" },
					{ name: "Crunchs" },
				],
			},
			{
				id: 2,
				title: "Haut du corps",
				exercises: [
					{ name: "Développé couché" },
					{ name: "Tractions" },
				],
			},
		];
		setPrograms(fakePrograms);
	}, []);

	const handleProgramSelect = (program) => {
		setSelectedProgram(program);
		// Initie un objet vide pour les données à remplir
		const initialData = {};
		program.exercises.forEach((ex) => {
			initialData[ex.name] = { reps: "", weight: "" };
		});
		setProgramData(initialData);
	};

	const handleProgramInputChange = (exerciseName, field, value) => {
		setProgramData((prev) => ({
			...prev,
			[exerciseName]: {
				...prev[exerciseName],
				[field]: value,
			},
		}));
	};

	const handleSaveWorkout = () => {
		const date = new Date().toISOString().split("T")[0];
		const completed = Object.entries(programData).map(([name, values]) => ({
			id: Date.now() + Math.random(),
			name,
			reps: values.reps,
			weight: values.weight,
			date,
		}));
		setWorkouts((prev) => [...prev, ...completed]);
		setSelectedProgram(null);
		setProgramData({});
	};

	return (
		<div className="dashboard">
			<h2>Bienvenue, {user?.name} 👋</h2>

			<h3>Choisissez un programme :</h3>
			<ul className="program-list">
				{programs.map((program) => (
					<li key={program.id}>
						<button onClick={() => handleProgramSelect(program)}>
							{program.title}
						</button>
					</li>
				))}
			</ul>

			{selectedProgram && (
				<div className="program-form">
					<h3>{selectedProgram.title}</h3>
					{selectedProgram.exercises.map((exercise, index) => (
						<div key={index} className="exercise-input">
							<strong>{exercise.name}</strong>
							<input
								type="text"
								placeholder="Reps"
								value={programData[exercise.name]?.reps || ""}
								onChange={(e) =>
									handleProgramInputChange(
										exercise.name,
										"reps",
										e.target.value
									)
								}
							/>
							<input
								type="text"
								placeholder="Poids"
								value={programData[exercise.name]?.weight || ""}
								onChange={(e) =>
									handleProgramInputChange(
										exercise.name,
										"weight",
										e.target.value
									)
								}
							/>
						</div>
					))}
					<button onClick={handleSaveWorkout}>
						Valider la séance
					</button>
				</div>
			)}

			<h3>Historique des entraînements</h3>
			<ul className="workout-history">
				{workouts.length > 0 ? (
					workouts.map((workout) => (
						<li key={workout.id}>
							<strong>{workout.name}</strong> – {workout.reps} –{" "}
							{workout.weight} ({workout.date})
						</li>
					))
				) : (
					<p>Aucun entraînement enregistré.</p>
				)}
			</ul>
		</div>
	);
};

export default Dashboard;
