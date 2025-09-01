import "./Navbar.scss";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
	const { user, logout } = useContext(AuthContext);
	const navigate = useNavigate();
	const [menuOpen, setMenuOpen] = useState(false);

	const handleLogout = () => {
		logout();
		navigate("/");
		setMenuOpen(false);
	};

	return (
		<nav className="navbar">
			<h1>
				<Link to="/">FitTrack</Link>
			</h1>

			{/* Burger selon ton SCSS */}
			<button
				className="burger-menu"
				aria-label="Ouvrir le menu"
				aria-controls="main-nav"
				aria-expanded={menuOpen}
				onClick={() => setMenuOpen((s) => !s)}
			>
				<span className={`bar ${menuOpen ? "open" : ""}`} />
				<span className={`bar ${menuOpen ? "open" : ""}`} />
				<span className={`bar ${menuOpen ? "open" : ""}`} />
			</button>

			{/* Ajout de .open sur UL comme attendu par ton SCSS */}
			<ul id="main-nav" className={`nav-links ${menuOpen ? "open" : ""}`}>
				<li>
					<Link to="/" onClick={() => setMenuOpen(false)}>
						Accueil
					</Link>
				</li>
				<li>
					<Link to="/programs" onClick={() => setMenuOpen(false)}>
						Programmes
					</Link>
				</li>
				{user && (
					<li>
						<Link
							to="/dashboard"
							onClick={() => setMenuOpen(false)}
						>
							Tableau de bord
						</Link>
					</li>
				)}
				{user?.role === "coach" && (
					<li>
						<Link
							to="/create-program"
							onClick={() => setMenuOpen(false)}
						>
							Créer un programme
						</Link>
					</li>
				)}
				{!user ? (
					<li>
						<Link to="/login" onClick={() => setMenuOpen(false)}>
							Connexion
						</Link>
					</li>
				) : (
					<li>
						<button onClick={handleLogout}>Déconnexion</button>
					</li>
				)}
			</ul>
		</nav>
	);
};

export default Navbar;
