import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartSpec } from "../domain/types";

const palette = [
  "#0ea5e9",
  "#f97316",
  "#14b8a6",
  "#f43f5e",
  "#84cc16",
  "#8b5cf6",
];

type ChartRendererProps = {
  chart: ChartSpec;
  onSelectValue: (column: string, value: string) => void;
};

export function ChartRenderer({ chart, onSelectValue }: ChartRendererProps) {
  if (chart.type === "pie") {
    const total = chart.data.reduce((sum, item) => {
      const value = Number(item[chart.yKey] ?? 0);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chart.data}
            dataKey={chart.yKey}
            nameKey={chart.xKey}
            innerRadius={62}
            outerRadius={108}
            cornerRadius={6}
            fill="#8884d8"
            paddingAngle={3}
            stroke="#0f172a"
            strokeWidth={2}
            labelLine={false}
            label={({ percent, x, y }) =>
              percent && percent > 0.06 ? (
                <text
                  x={x}
                  y={y}
                  fill="#cbd5e1"
                  fontSize={12}
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {`${Math.round(percent * 100)}%`}
                </text>
              ) : null
            }
            onClick={(entry) => {
              if (!chart.interactiveFilterKey) return;
              const value = String(entry?.[chart.xKey] ?? "");
              if (value) onSelectValue(chart.interactiveFilterKey, value);
            }}
          >
            {chart.data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={palette[index % palette.length]}
                stroke="rgba(15, 23, 42, 0.75)"
                strokeWidth={1}
              />
            ))}
            <Label
              value={total.toLocaleString()}
              position="center"
              style={{
                fill: "#e2e8f0",
                fontSize: "20px",
                fontWeight: 700,
              }}
            />
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              border: "none",
              background: "rgba(15, 23, 42, 0.95)",
              color: "#e2e8f0",
              boxShadow: "0 18px 40px -22px rgb(2 6 23 / 0.9)",
            }}
            itemStyle={{ color: "#e2e8f0" }}
            labelStyle={{ color: "#94a3b8" }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ color: "#cbd5e1", fontSize: "13px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chart.type === "scatter") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />
          <XAxis
            dataKey={chart.xKey}
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <YAxis
            dataKey={chart.yKey}
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Scatter name={chart.title} data={chart.data} fill="#0ea5e9" />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  // Default to Bar Chart
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chart.data}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e2e8f0"
          vertical={false}
        />
        <XAxis
          dataKey={chart.xKey}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#64748b", fontSize: 12 }}
          interval={0}
          // Simple logic to rotate labels if too many
          angle={chart.data.length > 8 ? -45 : 0}
          textAnchor={chart.data.length > 8 ? "end" : "middle"}
          height={chart.data.length > 8 ? 60 : 30}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#64748b", fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: "#f1f5f9" }}
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        />
        <Bar
          dataKey={chart.yKey}
          fill="#0ea5e9"
          radius={[4, 4, 0, 0]}
          onClick={(entry) => {
            if (!chart.interactiveFilterKey) return;
            const value = String(entry?.payload?.[chart.xKey] ?? "");
            if (value) onSelectValue(chart.interactiveFilterKey, value);
          }}
        >
          {chart.data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={palette[index % palette.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
