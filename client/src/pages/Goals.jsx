import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    CalendarDays,
    CheckCircle2,
    Flag,
    Plus,
    Target,
    Trash2,
    X
} from "lucide-react";

import api from "../api/axios";

const Goals = () => {
    const [goals, setGoals] = useState([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [isCreateOpen, setIsCreateOpen] =
        useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const fetchGoals = async () => {
        try {
            setError("");

            const response = await api.get(
                "/goals"
            );

            const goalsData =
                response.data.goals ||
                response.data.data ||
                [];

            setGoals(goalsData);
        } catch (requestError) {
            console.error(
                "Goals fetch error:",
                requestError
            );

            setError(
                requestError.response?.data
                    ?.message ||
                "Unable to load goals"
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleCreateGoal = async (
        goalData
    ) => {
        try {
            setIsSubmitting(true);
            setError("");

            await api.post(
                "/goals",
                goalData
            );

            setIsCreateOpen(false);

            await fetchGoals();
        } catch (requestError) {
            console.error(
                "Create goal error:",
                requestError
            );

            const message =
                requestError.response?.data
                    ?.message ||
                "Unable to create goal";

            setError(message);

            throw new Error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteGoal = async (
        goalId
    ) => {
        const shouldDelete =
            window.confirm(
                "Are you sure you want to delete this goal?"
            );

        if (!shouldDelete) {
            return;
        }

        try {
            setError("");

            await api.delete(
                `/goals/${goalId}`
            );

            setGoals((currentGoals) =>
                currentGoals.filter(
                    (goal) =>
                        getGoalId(goal) !==
                        goalId
                )
            );
        } catch (requestError) {
            console.error(
                "Delete goal error:",
                requestError
            );

            setError(
                requestError.response?.data
                    ?.message ||
                "Unable to delete goal"
            );
        }
    };

    const activeGoals = useMemo(() => {
        return goals.filter(
            (goal) =>
                getGoalStatus(goal) ===
                "active"
        );
    }, [goals]);

    const completedGoals = useMemo(() => {
        return goals.filter(
            (goal) =>
                getGoalStatus(goal) ===
                "completed"
        );
    }, [goals]);

    if (isLoading) {
        return (
            <div className="content-state">
                <span className="eyebrow">
                    PRACTICE GOALS
                </span>

                <h2>
                    Loading your goals...
                </h2>
            </div>
        );
    }

    return (
        <div className="goals-page">
            <header className="page-header goals-header">
                <div>
                    <span className="eyebrow">
                        PRACTICE PLANNING
                    </span>

                    <h1>
                        Your DSA Goals
                    </h1>

                    <p>
                        Set measurable problem-solving
                        targets and track your
                        progress using accepted
                        submissions.
                    </p>
                </div>

                <button
                    className="create-goal-button"
                    onClick={() =>
                        setIsCreateOpen(true)
                    }
                >
                    <Plus size={17} />

                    Create Goal
                </button>
            </header>

            <section className="goal-summary-grid">
                <GoalSummaryCard
                    icon={Target}
                    label="ACTIVE GOALS"
                    value={activeGoals.length}
                />

                <GoalSummaryCard
                    icon={CheckCircle2}
                    label="COMPLETED"
                    value={completedGoals.length}
                />

                <GoalSummaryCard
                    icon={Flag}
                    label="TOTAL GOALS"
                    value={goals.length}
                />
            </section>

            {error && (
                <div className="goals-error">
                    {error}
                </div>
            )}

            <section className="goals-section">
                <div className="goals-section-header">
                    <div>
                        <span className="eyebrow">
                            IN PROGRESS
                        </span>

                        <h2>Active Goals</h2>
                    </div>

                    <span className="goal-section-count">
                        {activeGoals.length}
                    </span>
                </div>

                {activeGoals.length > 0 ? (
                    <div className="goals-grid">
                        {activeGoals.map(
                            (goal) => (
                                <GoalCard
                                    key={
                                        getGoalId(goal)
                                    }
                                    goal={goal}
                                    onDelete={
                                        handleDeleteGoal
                                    }
                                />
                            )
                        )}
                    </div>
                ) : (
                    <div className="goals-empty">
                        <Target size={31} />

                        <strong>
                            No active goals
                        </strong>

                        <p>
                            Create a measurable DSA
                            practice goal and start
                            building consistency.
                        </p>

                        <button
                            onClick={() =>
                                setIsCreateOpen(true)
                            }
                        >
                            <Plus size={15} />

                            Create your first goal
                        </button>
                    </div>
                )}
            </section>

            {completedGoals.length > 0 && (
                <section className="goals-section completed-goals-section">
                    <div className="goals-section-header">
                        <div>
                            <span className="eyebrow">
                                ACHIEVEMENTS
                            </span>

                            <h2>
                                Completed Goals
                            </h2>
                        </div>

                        <span className="goal-section-count">
                            {
                                completedGoals.length
                            }
                        </span>
                    </div>

                    <div className="goals-grid">
                        {completedGoals.map(
                            (goal) => (
                                <GoalCard
                                    key={
                                        getGoalId(goal)
                                    }
                                    goal={goal}
                                    onDelete={
                                        handleDeleteGoal
                                    }
                                />
                            )
                        )}
                    </div>
                </section>
            )}

            {isCreateOpen && (
                <CreateGoalModal
                    onClose={() =>
                        setIsCreateOpen(false)
                    }
                    onSubmit={
                        handleCreateGoal
                    }
                    isSubmitting={
                        isSubmitting
                    }
                />
            )}
        </div>
    );
};

const GoalSummaryCard = ({
    icon: Icon,
    label,
    value
}) => {
    return (
        <article className="goal-summary-card">
            <div className="goal-summary-icon">
                <Icon size={19} />
            </div>

            <div>
                <span>{label}</span>

                <strong>{value}</strong>
            </div>
        </article>
    );
};

const GoalCard = ({
    goal,
    onDelete
}) => {
    const goalId = getGoalId(goal);

    const title =
        goal.title || "DSA Practice Goal";

    const targetProblems = Number(
        goal.targetProblems ??
        goal.target_problems ??
        0
    );

    const completedProblems = Number(
        goal.completedProblems ??
        goal.completed_problems ??
        0
    );

    const progress =
        targetProblems > 0
            ? Math.min(
                  100,
                  Math.round(
                      (
                          completedProblems /
                          targetProblems
                      ) * 100
                  )
              )
            : 0;

    const startDate =
        goal.startDate ||
        goal.start_date;

    const endDate =
        goal.endDate ||
        goal.end_date;

    const status =
        getGoalStatus(goal);

    return (
        <article className="goal-card">
            <div className="goal-card-top">
                <div className="goal-card-icon">
                    {status === "completed" ? (
                        <CheckCircle2 size={21} />
                    ) : (
                        <Target size={21} />
                    )}
                </div>

                <button
                    className="delete-goal-button"
                    onClick={() =>
                        onDelete(goalId)
                    }
                    title="Delete goal"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <span className="goal-status-label">
                {status === "completed"
                    ? "COMPLETED"
                    : "ACTIVE GOAL"}
            </span>

            <h3>{title}</h3>

            <div className="goal-progress-values">
                <span>
                    {completedProblems} solved
                </span>

                <strong>
                    {targetProblems} target
                </strong>
            </div>

            <div className="goal-progress-track">
                <div
                    className="goal-progress-fill"
                    style={{
                        width: `${progress}%`
                    }}
                />
            </div>

            <div className="goal-progress-footer">
                <strong>{progress}%</strong>

                <span>complete</span>
            </div>

            <div className="goal-date-range">
                <CalendarDays size={15} />

                <span>
                    {formatDate(startDate)}
                </span>

                <span>→</span>

                <span>
                    {formatDate(endDate)}
                </span>
            </div>
        </article>
    );
};

const CreateGoalModal = ({
    onClose,
    onSubmit,
    isSubmitting
}) => {
    const [formData, setFormData] =
        useState({
            title: "",
            targetProblems: "",
            startDate: getTodayDate(),
            endDate: ""
        });

    const [formError, setFormError] =
        useState("");

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

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        setFormError("");

        const targetProblems = Number(
            formData.targetProblems
        );

        if (!formData.title.trim()) {
            setFormError(
                "Goal title is required"
            );

            return;
        }

        if (
            !Number.isInteger(
                targetProblems
            ) ||
            targetProblems <= 0
        ) {
            setFormError(
                "Target problems must be a positive whole number"
            );

            return;
        }

        if (
            !formData.startDate ||
            !formData.endDate
        ) {
            setFormError(
                "Start date and end date are required"
            );

            return;
        }

        if (
            formData.endDate <
            formData.startDate
        ) {
            setFormError(
                "End date cannot be before start date"
            );

            return;
        }

        try {
            await onSubmit({
                title:
                    formData.title.trim(),

                targetProblems,

                startDate:
                    formData.startDate,

                endDate:
                    formData.endDate
            });
        } catch (submitError) {
            setFormError(
                submitError.message
            );
        }
    };

    return (
        <div
            className="goal-modal-backdrop"
            onClick={onClose}
        >
            <form
                className="goal-modal"
                onSubmit={handleSubmit}
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <button
                    type="button"
                    className="goal-modal-close"
                    onClick={onClose}
                >
                    <X size={19} />
                </button>

                <span className="eyebrow">
                    NEW PRACTICE TARGET
                </span>

                <h2>Create a Goal</h2>

                <p className="goal-modal-description">
                    Define a measurable target.
                    CodeVault will calculate progress
                    using accepted submissions during
                    the selected date range.
                </p>

                {formError && (
                    <div className="goal-form-error">
                        {formError}
                    </div>
                )}

                <label className="goal-form-field">
                    <span>GOAL TITLE</span>

                    <input
                        type="text"
                        name="title"
                        placeholder="Solve 20 DP problems"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </label>

                <label className="goal-form-field">
                    <span>
                        TARGET PROBLEMS
                    </span>

                    <input
                        type="number"
                        name="targetProblems"
                        min="1"
                        placeholder="20"
                        value={
                            formData.targetProblems
                        }
                        onChange={handleChange}
                    />
                </label>

                <div className="goal-date-fields">
                    <label className="goal-form-field">
                        <span>START DATE</span>

                        <input
                            type="date"
                            name="startDate"
                            value={
                                formData.startDate
                            }
                            onChange={handleChange}
                        />
                    </label>

                    <label className="goal-form-field">
                        <span>END DATE</span>

                        <input
                            type="date"
                            name="endDate"
                            min={
                                formData.startDate
                            }
                            value={
                                formData.endDate
                            }
                            onChange={handleChange}
                        />
                    </label>
                </div>

                <button
                    type="submit"
                    className="goal-submit-button"
                    disabled={isSubmitting}
                >
                    <Target size={16} />

                    {isSubmitting
                        ? "Creating..."
                        : "Create Goal"}
                </button>
            </form>
        </div>
    );
};

const getGoalId = (goal) => {
    return (
        goal.goalId ||
        goal.goal_id
    );
};

const getGoalStatus = (goal) => {
    const targetProblems = Number(
        goal.targetProblems ??
        goal.target_problems ??
        0
    );

    const completedProblems = Number(
        goal.completedProblems ??
        goal.completed_problems ??
        0
    );

    return completedProblems >=
        targetProblems &&
        targetProblems > 0
        ? "completed"
        : "active";
};

const formatDate = (date) => {
    if (!date) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(
        new Date(`${date}T00:00:00`)
    );
};

const getTodayDate = () => {
    const date = new Date();

    const year =
        date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export default Goals;