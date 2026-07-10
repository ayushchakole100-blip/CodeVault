const StatCard = ({
    label,
    value,
    helper,
    icon: Icon
}) => {
    return (
        <article className="stat-card">
            <div className="stat-card-header">
                <span>{label}</span>

                <div className="stat-icon">
                    <Icon size={18} />
                </div>
            </div>

            <strong className="stat-value">
                {value}
            </strong>

            <span className="stat-helper">
                {helper}
            </span>
        </article>
    );
};

export default StatCard;