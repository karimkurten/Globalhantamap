import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const tooltipStyle = {
  background: "#121212",
  border: "1px solid #2a2a2a",
  borderRadius: 4,
  fontSize: 12,
  fontFamily: "JetBrains Mono, monospace",
};

export function EpidemicCurve({ data, height = 240, dataKey = "new_cases", color = "#FF3B30" }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1f1f1f" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#737373"
          fontSize={10}
          tickFormatter={(d) => d.slice(5)}
        />
        <YAxis stroke="#737373" fontSize={10} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: "#a0a0a0" }}
          itemStyle={{ color: "#fff" }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill="url(#curveGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CumulativeChart({ data, height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="#1f1f1f" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#737373"
          fontSize={10}
          tickFormatter={(d) => d.slice(5)}
        />
        <YAxis stroke="#737373" fontSize={10} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: "#a0a0a0" }}
          itemStyle={{ color: "#fff" }}
        />
        <Line
          type="monotone"
          dataKey="cumulative_cases"
          stroke="#FF3B30"
          strokeWidth={2}
          dot={false}
          name="Cases"
        />
        <Line
          type="monotone"
          dataKey="cumulative_deaths"
          stroke="#FF9500"
          strokeWidth={2}
          dot={false}
          name="Deaths"
        />
        <Line
          type="monotone"
          dataKey="cumulative_recovered"
          stroke="#34C759"
          strokeWidth={2}
          dot={false}
          name="Recovered"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DailyBars({ data, height = 200, dataKey = "new_cases", color = "#FF3B30" }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="#1f1f1f" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#737373"
          fontSize={10}
          tickFormatter={(d) => d.slice(5)}
        />
        <YAxis stroke="#737373" fontSize={10} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: "#a0a0a0" }}
          itemStyle={{ color: "#fff" }}
        />
        <Bar dataKey={dataKey} fill={color} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
