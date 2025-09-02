import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Programs from "../pages/Programs";
import CreateProgram from "../pages/CreateProgram";
import PrivateRoute from "../components/PrivateRoute";
import Account from "../pages/Account";

const AppRoutes = () => {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/login" element={<Login />} />

			<Route
				path="/account"
				element={
					<PrivateRoute>
						<Account />
					</PrivateRoute>
				}
			/>

			<Route
				path="/dashboard"
				element={
					<PrivateRoute>
						<Dashboard />
					</PrivateRoute>
				}
			/>

			<Route path="/programs" element={<Programs />} />

			<Route
				path="/create-program"
				element={
					<PrivateRoute>
						<CreateProgram />
					</PrivateRoute>
				}
			/>
		</Routes>
	);
};

export default AppRoutes;
