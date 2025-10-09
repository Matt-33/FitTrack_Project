import { useEffect, useState } from "react";
import { api } from "../lib/api";
import Spinner from "./Spinner";
import "./ActivityModal.scss";

const ActivityModal = ({ id, onClose }) => {
	const [loading, setLoading] = useState(true);
	const [item, setItem] = useState(null);
	const [error, setError] = useState("");

	useEffect(() => {
		let alive = true;
		(async () => {
			setLoading(true);
			setError("");
			try {
				const { data } = await api.get(`/api/history/${id}`);
				if (alive) setItem(data);
			} catch (e) {
				if (alive)
					setError(
						e?.response?.data?.message || "Erreur de chargement"
					);
			} finally {
				if (alive) setLoading(false);
			}
		})();
		return () => {
			alive = false;
		};
	}, [id]);

	const close = () => onClose?.();

	return (
		<div className="modal-backdrop" onClick={close}>
			<div className="modal" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h3>Détails de la séance</h3>
					<button className="btn btn-ghost" onClick={close}>
						✕
					</button>
				</div>

				<div className="modal-body">
					{loading ? (
						<div
							style={{
								display: "flex",
								justifyContent: "center",
								padding: 16,
							}}
						>
							<Spinner />
						</div>
					) : error ? (
						<div className="error">{error}</div>
					) : item ? (
						<div className="activity-details">
							<div className="row">
								<div className="label">Date</div>
								<div className="value">
									{new Date(
										item.performedAt || item.createdAt
									).toLocaleString()}
								</div>
							</div>

							<div className="row">
								<div className="label">Programme</div>
								<div className="value">
									{item.Programme?.title || "—"}
								</div>
							</div>

							<div className="row">
								<div className="label">Exercice</div>
								<div className="value">
									{item.Exercice?.name || "—"}
								</div>
							</div>

							<div className="row">
								<div className="label">Durée</div>
								<div className="value">
									{item.durationMin
										? `${item.durationMin} min`
										: "—"}
								</div>
							</div>

							<div className="row">
								<div className="label">Poids utilisé</div>
								<div className="value">
									{item.weightUsed || "—"}
								</div>
							</div>

							<div className="row">
								<div className="label">Notes</div>
								<div className="value">{item.notes || "—"}</div>
							</div>
						</div>
					) : null}
				</div>

				<div className="modal-footer">
					<button className="btn btn-primary" onClick={close}>
						Fermer
					</button>
				</div>
			</div>
		</div>
	);
};

export default ActivityModal;
