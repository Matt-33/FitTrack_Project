import {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
} from "react";
import "./Toast.scss";

const ToastContext = createContext(null);
let idSeq = 0;

export function ToastProvider({ children }) {
	const [toasts, setToasts] = useState([]);

	const remove = useCallback(
		(id) => setToasts((t) => t.filter((x) => x.id !== id)),
		[]
	);
	const push = useCallback(
		(type, message, opts = {}) => {
			const id = ++idSeq;
			const ttl = opts.ttl ?? 3000;
			setToasts((t) => [...t, { id, type, message }]);
			if (ttl) setTimeout(() => remove(id), ttl);
		},
		[remove]
	);

	const api = useMemo(
		() => ({
			success: (m, opts) => push("success", m, opts),
			error: (m, opts) => push("error", m, opts),
			info: (m, opts) => push("info", m, opts),
			warn: (m, opts) => push("warning", m, opts),
		}),
		[push]
	);

	return (
		<ToastContext.Provider value={{ toast: api }}>
			{children}
			<div className="toast-viewport">
				{toasts.map((t) => (
					<div key={t.id} className={`toast ${t.type}`}>
						<span>{t.message}</span>
						<button
							className="toast-close"
							onClick={() => remove(t.id)}
							aria-label="Fermer"
						>
							×
						</button>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}

export const useToast = () => {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error("useToast must be used within ToastProvider");
	return ctx;
};
