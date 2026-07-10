import {
    Outlet,
    useLocation,
    useNavigate
} from "react-router-dom";

import {
    BarChart3,
    BookOpen,
    Code2,
    LayoutDashboard,
    Lightbulb,
    ListTodo,
    LogOut,
    Trophy
} from "lucide-react";

import {
    useAuth
} from "../context/AuthContext";

const navigationItems = [
    {
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard
    },
    {
        label: "Problems",
        path: "/problems",
        icon: BookOpen
    },
    {
        label: "Recommendations",
        path: "/recommendations",
        icon: Lightbulb
    },
    {
        label: "Goals",
        path: "/goals",
        icon: ListTodo
    },
    {
        label: "Analytics",
        path: "/analytics",
        icon: BarChart3
    },
    {
        label: "Leaderboard",
        path: "/leaderboard",
        icon: Trophy
    }
];

const DashboardLayout = () => {
    const location = useLocation();

    const navigate = useNavigate();

    const {
        user,
        logout
    } = useAuth();

    const handleLogout = () => {
        logout();

        navigate("/login");
    };

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">
                        <Code2 size={22} />
                    </div>

                    <span>CodeVault</span>
                </div>

                <nav className="sidebar-navigation">
                    <span className="sidebar-section-label">
                        WORKSPACE
                    </span>

                    {navigationItems.map((item) => {
                        const Icon = item.icon;

                        const isActive =
                            location.pathname ===
                            item.path;

                        return (
                            <button
                                key={item.path}
                                className={
                                    isActive
                                        ? "sidebar-link active"
                                        : "sidebar-link"
                                }
                                onClick={() =>
                                    navigate(item.path)
                                }
                            >
                                <Icon size={18} />

                                <span>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {user?.name
                                ?.charAt(0)
                                .toUpperCase() || "D"}
                        </div>

                        <div>
                            <strong>
                                {user?.name ||
                                    "Developer"}
                            </strong>

                            <span>
                                DSA Developer
                            </span>
                        </div>
                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />

                        Logout
                    </button>
                </div>
            </aside>

            <main className="app-content">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;