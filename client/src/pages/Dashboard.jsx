import {
    useAuth
} from "../context/AuthContext";

const Dashboard = () => {
    const {
        user,
        logout
    } = useAuth();

    return (
        <main className="temporary-dashboard">
            <div>
                <span className="eyebrow">
                    CODEVAULT DASHBOARD
                </span>

                <h1>
                    Welcome, {user?.name || "Developer"}
                </h1>

                <p>
                    Authentication is working.
                    The complete dashboard is coming
                    in the next frontend step.
                </p>

                <button
                    className="primary-button dashboard-button"
                    onClick={logout}
                >
                    Logout
                </button>
            </div>
        </main>
    );
};

export default Dashboard;