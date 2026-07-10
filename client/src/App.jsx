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

import Recommendations from
    "./pages/Recommendations";

import Goals from
    "./pages/Goals";

import Leaderboard from
    "./pages/Leaderboard";

import Analytics from
    "./pages/Analytics";

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
                <Route
                    path="/recommendations"
                    element={<Recommendations />}
                />
                <Route
                    path="/goals"
                    element={<Goals />}
                />
                <Route
                    path="/analytics"
                    element={<Analytics />}
                />
                <Route
                    path="/leaderboard"
                    element={<Leaderboard />}
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