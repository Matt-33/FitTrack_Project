import "./Navbar.scss";
import { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
	const { user, logout } = useContext(AuthContext);
	const navigate = useNavigate();
	const [menuOpen, setMenuOpen] = useState(false);

	const closeMenu = useCallback(() => setMenuOpen(false), []);
	const toggleMenu = () => setMenuOpen((s) => !s);

	const handleLogout = () => {
		logout();
		navigate("/");
		closeMenu();
	};

	useEffect(() => {
		const onKey = (e) => e.key === "Escape" && closeMenu();
		const onResize = () => {
			if (window.innerWidth >= 768) closeMenu();
		};
		window.addEventListener("keydown", onKey);
		window.addEventListener("resize", onResize);
		return () => {
			window.removeEventListener("keydown", onKey);
			window.removeEventListener("resize", onResize);
		};
	}, [closeMenu]);

	return (
		<nav
			className={`navbar ${menuOpen ? "is-open" : ""}`}
			role="navigation"
			aria-label="Navigation principale"
		>
			<div className="nav-inner">
				<h1 className="brand">
					<Link to="/" onClick={closeMenu}>
						FitTrack
					</Link>
				</h1>

				{/* Burger */}
				<button
					className="burger-menu"
					aria-label="Ouvrir le menu"
					aria-controls="main-nav"
					aria-expanded={menuOpen}
					onClick={toggleMenu}
				>
					<span className={`bar ${menuOpen ? "open" : ""}`} />
					<span className={`bar ${menuOpen ? "open" : ""}`} />
					<span className={`bar ${menuOpen ? "open" : ""}`} />
				</button>

				{/* Liens */}
				<ul
					id="main-nav"
					className={`nav-links ${menuOpen ? "open" : ""}`}
				>
					<li>
						<NavLink to="/" end onClick={closeMenu}>
							Accueil
						</NavLink>
					</li>
					<li>
						<NavLink to="/programs" onClick={closeMenu}>
							Programmes
						</NavLink>
					</li>
					{user && (
						<li>
							<NavLink to="/dashboard" onClick={closeMenu}>
								Tableau de bord
							</NavLink>
						</li>
					)}
					{user && (
						<li>
							<NavLink
								to="/account"
								onClick={() => setMenuOpen(false)}
							>
								Compte
							</NavLink>
						</li>
					)}
					{user?.role === "coach" && (
						<li>
							<NavLink to="/create-program" onClick={closeMenu}>
								Créer un programme
							</NavLink>
						</li>
					)}
					{!user ? (
						<li className="nav-cta">
							<NavLink
								to="/login"
								onClick={closeMenu}
								className="btn btn-primary small"
							>
								Connexion
							</NavLink>
						</li>
					) : (
						<li className="nav-cta">
							<button
								onClick={handleLogout}
								className="btn btn-ghost small"
							>
								Déconnexion
							</button>
						</li>
					)}
				</ul>
			</div>

			{/* Backdrop mobile */}
			<div
				className={`nav-backdrop ${menuOpen ? "show" : ""}`}
				onClick={closeMenu}
				aria-hidden={!menuOpen}
			/>
		</nav>
	);
};

export default Navbar;
