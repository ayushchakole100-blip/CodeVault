import {
    useState
} from "react";

import {
    Link,
    Navigate,
    useNavigate
} from "react-router-dom";

import {
    Code2,
    LockKeyhole,
    Mail
} from "lucide-react";

import api from "../api/axios";

import {
    useAuth
} from "../context/AuthContext";

const Login = () => {
    const navigate = useNavigate();

    const {
        login,
        isAuthenticated
    } = useAuth();

    const [formData, setFormData] =
        useState({
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
            const response = await api.post(
                "/auth/login",
                formData
            );

            login({
                token: response.data.token,
                user: response.data.user
            });

            navigate("/dashboard");
        } catch (requestError) {
            setError(
                requestError.response?.data
                    ?.message ||
                "Unable to login"
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
                        DSA PERFORMANCE PLATFORM
                    </span>

                    <h1>
                        Turn your problem-solving
                        data into better practice.
                    </h1>

                    <p>
                        Track submissions, identify
                        weak topics and get
                        priority-based DSA problem
                        recommendations.
                    </p>

                    <div className="algorithm-card">
                        <div className="code-line">
                            <span>01</span>
                            <code>
                                topicWeakness * 0.60
                            </code>
                        </div>

                        <div className="code-line">
                            <span>02</span>
                            <code>
                                difficulty * 0.25
                            </code>
                        </div>

                        <div className="code-line">
                            <span>03</span>
                            <code>
                                ratingMatch * 0.15
                            </code>
                        </div>

                        <div className="code-result">
                            priority_queue
                            {"<Recommendation>"}
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
                        <h2>Welcome back</h2>

                        <p>
                            Sign in to continue your
                            problem-solving journey.
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
                                    placeholder="Enter your password"
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
                                ? "Signing in..."
                                : "Sign in"}
                        </button>
                    </form>

                    <p className="auth-switch">
                        New to CodeVault?{" "}

                        <Link to="/register">
                            Create an account
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
};

export default Login;