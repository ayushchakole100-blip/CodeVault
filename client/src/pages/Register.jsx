import {
    useState
} from "react";

import {
    Code2,
    LockKeyhole,
    Mail,
    User
} from "lucide-react";

import {
    Link,
    Navigate,
    useNavigate
} from "react-router-dom";

import api from "../api/axios";

import {
    useAuth
} from "../context/AuthContext";

const Register = () => {
    const navigate = useNavigate();

    const {
        isAuthenticated
    } = useAuth();

    const [formData, setFormData] =
        useState({
            name: "",
            email: "",
            password: ""
        });

    const [error, setError] =
        useState("");

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    if (isAuthenticated) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    const handleChange = (event) => {
        const {
            name,
            value
        } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setIsSubmitting(true);

        try {
            await api.post(
                "/auth/register",
                formData
            );

            navigate("/login");
        } catch (requestError) {
            setError(
                requestError.response?.data
                    ?.message ||
                "Unable to create account"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-brand-panel">
                <div className="brand">
                    <div className="brand-icon">
                        <Code2 size={26} />
                    </div>

                    <span>CodeVault</span>
                </div>

                <div className="auth-brand-content">
                    <span className="eyebrow">
                        BUILD BETTER DSA HABITS
                    </span>

                    <h1>
                        Your coding progress deserves
                        more than a solved counter.
                    </h1>

                    <p>
                        CodeVault connects your
                        submissions, analytics, goals
                        and C++ recommendation engine
                        in one developer dashboard.
                    </p>

                    <div className="feature-grid">
                        <div>
                            <strong>01</strong>
                            <span>
                                Topic analytics
                            </span>
                        </div>

                        <div>
                            <strong>02</strong>
                            <span>
                                C++ recommendations
                            </span>
                        </div>

                        <div>
                            <strong>03</strong>
                            <span>
                                Goal tracking
                            </span>
                        </div>

                        <div>
                            <strong>04</strong>
                            <span>
                                Leaderboard
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="auth-form-panel">
                <div className="auth-form-container">
                    <span className="mobile-brand">
                        <Code2 size={24} />
                        CodeVault
                    </span>

                    <div className="auth-heading">
                        <h2>Create your account</h2>

                        <p>
                            Start tracking your DSA
                            performance.
                        </p>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >
                        <label>
                            Full name

                            <div className="input-wrapper">
                                <User size={18} />

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Ayush Chakole"
                                    value={
                                        formData.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />
                            </div>
                        </label>

                        <label>
                            Email address

                            <div className="input-wrapper">
                                <Mail size={18} />

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={
                                        formData.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />
                            </div>
                        </label>

                        <label>
                            Password

                            <div className="input-wrapper">
                                <LockKeyhole
                                    size={18}
                                />

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Create a password"
                                    value={
                                        formData.password
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />
                            </div>
                        </label>

                        <button
                            className="primary-button"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Creating account..."
                                : "Create account"}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already have an account?{" "}

                        <Link to="/login">
                            Sign in
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
};

export default Register;