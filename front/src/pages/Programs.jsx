import { useEffect, useState } from "react";
import "./Programs.scss";

// 👉 Simule des données reçues d'une API
const fakePrograms = [
	{
		id: 1,
		title: "Programme prise de masse débutant",
		goal: "prise de masse",
		coach: "Matthias",
		exercises: [
			{ name: "Développé couché", reps: "4x10", weight: "60kg" },
			{ name: "Squat", reps: "4x12", weight: "80kg" },
		],
	},
	{
		id: 2,
		title: "Programme sèche intense",
		goal: "sèche",
		coach: "Julie",
		exercises: [
			{ name: "Burpees", reps: "5x20", duration: "30s repos" },
			{ name: "Corde à sauter", duration: "3min" },
		],
	},
];

const Programs = () => {
	const [programs, setPrograms] = useState([]);

	useEffect(() => {
		// 🛠 À remplacer par un fetch API plus tard
		setPrograms(fakePrograms);
	}, []);

	return (
		<div className="programs">
			<h2>Programmes disponibles</h2>

			{programs.length === 0 ? (
				<p>Aucun programme pour l’instant.</p>
			) : (
				programs.map((program) => (
					<div key={program.id} className="program-card">
						<h3>{program.title}</h3>
						<p>
							<strong>Objectif :</strong> {program.goal}
						</p>
						{program.coach && (
							<p>
								<strong>Coach :</strong> {program.coach}
							</p>
						)}

						<ul>
							{program.exercises.map((ex, i) => (
								<li key={i}>
									{ex.name} – {ex.reps || ex.duration || ""}{" "}
									{ex.weight && `– ${ex.weight}`}
								</li>
							))}
						</ul>
					</div>
				))
			)}
		</div>
	);
};

export default Programs;
