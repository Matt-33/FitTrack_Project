import "./Account.scss";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../lib/api";
import { useToast } from "../components/ToastProvider";
import Spinner from "../components/Spinner";

const Account = () => {
	const { user, replaceUser } = useContext(AuthContext);
	const { toast } = useToast();

	const [name, setName] = useState(user?.name || "");
	const [email, setEmail] = useState(user?.email || "");
	const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
	const [bio, setBio] = useState(user?.bio || "");
	const [saving, setSaving] = useState(false);

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [pwdSaving, setPwdSaving] = useState(false);

	const [inviteCode, setInviteCode] = useState("");
	const [upgrading, setUpgrading] = useState(false);

	if (!user)
		return (
			<div className="account-page gate">Veuillez vous connecter.</div>
		);

	const saveProfile = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			const { data } = await api.patch("/api/users/me", {
				name,
				avatarUrl: avatarUrl || null,
				bio: bio || null,
			});
			replaceUser(data.user);
			toast.success("Profil mis à jour ✅");
		} catch (e) {
			toast.error(e?.response?.data?.message || "Erreur de mise à jour");
		} finally {
			setSaving(false);
		}
	};

	const changePwd = async (e) => {
		e.preventDefault();
		setPwdSaving(true);
		try {
			await api.post("/api/users/change-password", {
				currentPassword,
				newPassword,
			});
			setCurrentPassword("");
			setNewPassword("");
			toast.success("Mot de passe changé ✅");
		} catch (e) {
			toast.error(e?.response?.data?.message || "Erreur de mot de passe");
		} finally {
			setPwdSaving(false);
		}
	};

	const upgrade = async (e) => {
		e.preventDefault();
		setUpgrading(true);
		try {
			const { data } = await api.post("/api/users/coach/upgrade", {
				code: inviteCode || undefined,
			});
			replaceUser(data.user);
			toast.success("Tu es maintenant coach 🎉");
		} catch (e) {
			toast.error(
				e?.response?.data?.message || "Impossible de passer coach"
			);
		} finally {
			setUpgrading(false);
		}
	};

	return (
		<div className="account-page">
			<h2>Mon compte</h2>

			<section className="grid">
				{/* Profil */}
				<form className="card" onSubmit={saveProfile}>
					<h3>Profil</h3>
					<div className="row">
						<label>Nom</label>
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
					<div className="row">
						<label>Email</label>
						<input value={email} disabled />
					</div>
					<div className="row">
						<label>Avatar (URL)</label>
						<input
							value={avatarUrl}
							onChange={(e) => setAvatarUrl(e.target.value)}
							placeholder="https://..."
						/>
					</div>
					<div className="row">
						<label>Bio</label>
						<textarea
							rows={3}
							value={bio}
							onChange={(e) => setBio(e.target.value)}
						/>
					</div>
					<div className="actions">
						<button className="btn btn-primary" disabled={saving}>
							{saving ? <Spinner /> : "Enregistrer"}
						</button>
					</div>
				</form>

				{/* Sécurité */}
				<form className="card" onSubmit={changePwd}>
					<h3>Sécurité</h3>
					<div className="row">
						<label>Mot de passe actuel</label>
						<input
							type="password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							required
						/>
					</div>
					<div className="row">
						<label>Nouveau mot de passe</label>
						<input
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							required
						/>
					</div>
					<div className="actions">
						<button className="btn btn-ghost" disabled={pwdSaving}>
							{pwdSaving ? (
								<Spinner />
							) : (
								"Changer le mot de passe"
							)}
						</button>
					</div>
				</form>

				{/* Upgrade rôle */}
				<form className="card" onSubmit={upgrade}>
					<h3>Rôle & accès</h3>
					<p className="hint">
						Rôle actuel : <strong>{user.role}</strong>
					</p>

					{user.role !== "coach" ? (
						<>
							<div className="row">
								<label>Code d’invitation (optionnel)</label>
								<input
									value={inviteCode}
									onChange={(e) =>
										setInviteCode(e.target.value)
									}
									placeholder="Saisis ton code si requis"
								/>
							</div>
							<div className="actions">
								<button
									className="btn btn-outline"
									disabled={upgrading}
								>
									{upgrading ? <Spinner /> : "Devenir coach"}
								</button>
							</div>
						</>
					) : (
						<div className="ok">Tu es coach ✅</div>
					)}
				</form>
			</section>
		</div>
	);
};

export default Account;
