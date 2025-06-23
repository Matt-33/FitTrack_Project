import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Programs from "../pages/Programs";
import CreateProgram from "../pages/CreateProgram";
import AccountSettings from "../pages/AccountSettings";
import PrivateRoute from "../components/PrivateRoute";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const AppRoutes = () => {
	const { user } = useContext(AuthContext);

	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/login" element={<Login />} />
			<Route
				path="/dashboard"
				element={
					<PrivateRoute>
						<Dashboard />
					</PrivateRoute>
				}
			/>
			<Route
				path="/programs"
				element={
					<PrivateRoute>
						<Programs />
					</PrivateRoute>
				}
			/>
			<Route
				path="/account"
				element={
					<PrivateRoute>
						<AccountSettings />
					</PrivateRoute>
				}
			/>
			{user?.role === "coach" && (
				<Route
					path="/create-program"
					element={
						<PrivateRoute>
							<CreateProgram />
						</PrivateRoute>
					}
				/>
			)}
		</Routes>
	);
};

export default AppRoutes;
