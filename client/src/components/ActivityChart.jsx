import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

const ActivityChart = ({
    activity
}) => {
    return (
        <div className="chart-container">
            <ResponsiveContainer
                width="100%"
                height="100%"
            >
                <BarChart
                    data={activity}
                    margin={{
                        top: 10,
                        right: 5,
                        left: -25,
                        bottom: 0
                    }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#27272a"
                    />

                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                            fill: "#71717a",
                            fontSize: 12
                        }}
                    />

                    <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{
                            fill: "#71717a",
                            fontSize: 12
                        }}
                    />

                    <Tooltip
                        cursor={{
                            fill:
                                "rgba(124, 58, 237, 0.08)"
                        }}
                        contentStyle={{
                            background: "#18181b",
                            border:
                                "1px solid #3f3f46",
                            borderRadius: "10px",
                            color: "#fafafa"
                        }}
                    />

                    <Bar
                        dataKey="submissions"
                        fill="#7c3aed"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={42}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ActivityChart;