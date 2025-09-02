import { createContext, useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	// état initial depuis localStorage
	const [user, setUser] = useState(() => {
		try {
			const raw = localStorage.getItem("ft_user");
			return raw ? JSON.parse(raw) : null;
		} catch {
			return null;
		}
	});
	const [token, setToken] = useState(() => localStorage.getItem("ft_token"));

	// garder l’en-tête Authorization d’axios synchronisé
	useEffect(() => {
		if (token) {
			api.defaults.headers.common.Authorization = `Bearer ${token}`;
			localStorage.setItem("ft_token", token);
		} else {
			delete api.defaults.headers.common.Authorization;
			localStorage.removeItem("ft_token");
		}
	}, [token]);

	// helpers
	const replaceUser = useCallback((u) => {
		setUser(u);
		if (u) localStorage.setItem("ft_user", JSON.stringify(u));
		else localStorage.removeItem("ft_user");
	}, []);

	const saveAuth = useCallback(
		(u, t) => {
			replaceUser(u);
			setToken(t);
		},
		[replaceUser]
	);

	// actions
	const login = useCallback(
		async (email, password) => {
			const { data } = await api.post("/api/auth/login", {
				email,
				password,
			});
			saveAuth(data.user, data.token);
		},
		[saveAuth]
	);

	const register = useCallback(
		async (name, email, password) => {
			const { data } = await api.post("/api/auth/register", {
				name,
				email,
				password,
			});
			saveAuth(data.user, data.token);
		},
		[saveAuth]
	);

	const logout = useCallback(() => {
		replaceUser(null);
		setToken(null);
	}, [replaceUser]);

	return (
		<AuthContext.Provider
			value={{ user, token, login, register, logout, replaceUser }}
		>
			{children}
		</AuthContext.Provider>
	);
};
