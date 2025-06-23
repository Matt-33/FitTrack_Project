import { createContext, useReducer, useEffect } from "react";

// État initial
const initialState = {
	user: JSON.parse(localStorage.getItem("user")) || null,
	token: localStorage.getItem("token") || null,
};

// Reducer pour gérer les actions
const authReducer = (state, action) => {
	switch (action.type) {
		case "LOGIN":
			localStorage.setItem("user", JSON.stringify(action.payload.user));
			localStorage.setItem("token", action.payload.token);
			return {
				...state,
				user: action.payload.user,
				token: action.payload.token,
			};

		case "LOGOUT":
			localStorage.removeItem("user");
			localStorage.removeItem("token");
			return { ...state, user: null, token: null };

		default:
			return state;
	}
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [state, dispatch] = useReducer(authReducer, initialState);

	return (
		<AuthContext.Provider value={{ ...state, dispatch }}>
			{children}
		</AuthContext.Provider>
	);
};
