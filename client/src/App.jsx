import {
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import DashboardLayout from
    "./layouts/DashboardLayout";

import Dashboard from
    "./pages/Dashboard";

import Problems from
    "./pages/Problems";

import Login from
    "./pages/Login";

import Register from
    "./pages/Register";

import ProtectedRoute from
    "./routes/ProtectedRoute";

const App = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />
                <Route
                    path="/problems"
                    element={<Problems />}
                />
            </Route>

            <Route
                path="*"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />
        </Routes>
    );
};

export default App;