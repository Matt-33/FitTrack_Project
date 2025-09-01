import { createContext, useReducer } from "react";
import { api } from "../lib/api";

const initialState = {
	user: JSON.parse(localStorage.getItem("user")) || null,
	token: localStorage.getItem("token") || null,
};

const authReducer = (state, action) => {
	switch (action.type) {
		case "LOGIN_SUCCESS": {
			const { user, token } = action.payload;
			localStorage.setItem("user", JSON.stringify(user));
			localStorage.setItem("token", token);
			return { ...state, user, token };
		}
		case "LOGOUT": {
			localStorage.removeItem("user");
			localStorage.removeItem("token");
			return { ...state, user: null, token: null };
		}
		default:
			return state;
	}
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [state, dispatch] = useReducer(authReducer, initialState);

	// API helpers
	const login = async (email, password) => {
		const { data } = await api.post("/api/auth/login", { email, password });
		dispatch({
			type: "LOGIN_SUCCESS",
			payload: { user: data.user, token: data.token },
		});
		return data.user;
	};

	const register = async (name, email, password) => {
		const { data } = await api.post("/api/auth/register", {
			name,
			email,
			password,
		});
		dispatch({
			type: "LOGIN_SUCCESS",
			payload: { user: data.user, token: data.token },
		});
		return data.user;
	};

	const logout = () => dispatch({ type: "LOGOUT" });

	return (
		<AuthContext.Provider
			value={{ ...state, dispatch, login, register, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
};
