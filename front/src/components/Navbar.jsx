import "./Navbar.scss";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
	const { user, dispatch } = useContext(AuthContext);
	const navigate = useNavigate();
	const [menuOpen, setMenuOpen] = useState(false);

	const handleLogout = () => {
		dispatch({ type: "LOGOUT" });
		navigate("/");
		setMenuOpen(false);
	};

	const toggleMenu = () => {
		setMenuOpen(!menuOpen);
	};

	return (
		<nav className="navbar">
			<h1>FitTrack</h1>
			<div className="burger-menu" onClick={toggleMenu}>
				<div className={`bar ${menuOpen ? "open" : ""}`}></div>
				<div className={`bar ${menuOpen ? "open" : ""}`}></div>
				<div className={`bar ${menuOpen ? "open" : ""}`}></div>
			</div>

			<ul className={`nav-links ${menuOpen ? "open" : ""}`}>
				<li>
					<Link to="/" onClick={() => setMenuOpen(false)}>
						Accueil
					</Link>
				</li>

				{user && (
					<>
						<li>
							<Link
								to="/dashboard"
								onClick={() => setMenuOpen(false)}
							>
								Dashboard
							</Link>
						</li>
						<li>
							<Link
								to="/programs"
								onClick={() => setMenuOpen(false)}
							>
								Programmes
							</Link>
						</li>
						<li>
							<Link
								to="/account"
								onClick={() => setMenuOpen(false)}
							>
								Paramètres
							</Link>
						</li>
						{user.role === "coach" && (
							<li>
								<Link
									to="/create-program"
									onClick={() => setMenuOpen(false)}
								>
									Créer un programme
								</Link>
							</li>
						)}
						<li>
							<button onClick={handleLogout}>Déconnexion</button>
						</li>
					</>
				)}

				{!user && (
					<li>
						<Link to="/login" onClick={() => setMenuOpen(false)}>
							Connexion
						</Link>
					</li>
				)}
			</ul>
		</nav>
	);
};

export default Navbar;
