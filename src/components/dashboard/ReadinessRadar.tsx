"use client";

// This component is loaded with next/dynamic ssr:false — no SSR concerns.
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export interface RadarPoint {
  subject: string;
  mastery: number;
  fullMark: number;
}

interface Props {
  data: RadarPoint[];
}

function masteryColor(m: number): string {
  if (m >= 80) return "#4ade80"; // green-400
  if (m >= 60) return "#facc15"; // yellow-400
  return "#f87171"; // red-400
}

// recharts passes x/y as string | number; textAnchor uses the SVG union type
interface AxisTickProps {
  x?: string | number;
  y?: string | number;
  payload?: { value: string };
  textAnchor?: "start" | "middle" | "end" | "inherit";
}

export function ReadinessRadar({ data }: Props) {
  const masteryByLabel: Record<string, number> = {};
  for (const d of data) masteryByLabel[d.subject] = d.mastery;

  const renderTick = ({
    x: rawX = 0,
    y: rawY = 0,
    payload,
    textAnchor = "middle",
  }: AxisTickProps) => {
    const x = typeof rawX === "string" ? parseFloat(rawX) : rawX;
    const y = typeof rawY === "string" ? parseFloat(rawY) : rawY;

    const label = payload?.value ?? "";
    const mastery = masteryByLabel[label] ?? 0;
    const color = masteryColor(mastery);

    const words = label.split(" ");
    const mid = Math.ceil(words.length / 2);
    const lines =
      words.length > 2
        ? [words.slice(0, mid).join(" "), words.slice(mid).join(" ")]
        : [label];

    return (
      <g>
        {lines.map((line, i) => (
          <text
            key={i}
            x={x}
            y={y + i * 14}
            textAnchor={textAnchor}
            fill={color}
            fontSize={11}
            fontWeight={500}
          >
            {line}
          </text>
        ))}
        <text
          x={x}
          y={y + lines.length * 14}
          textAnchor={textAnchor}
          fill={color}
          fontSize={10}
          opacity={0.6}
        >
          {mastery}%
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart
        data={data}
        margin={{ top: 30, right: 50, bottom: 30, left: 50 }}
      >
        <PolarGrid stroke="#27272a" strokeWidth={1} />
        <PolarAngleAxis
          dataKey="subject"
          tick={renderTick}
          tickLine={false}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={false}
          axisLine={false}
          tickLine={false}
          stroke="#27272a"
        />
        <Radar
          name="Mastery"
          dataKey="mastery"
          stroke="#60a5fa"
          strokeWidth={1.5}
          fill="#60a5fa"
          fillOpacity={0.12}
          dot={{ fill: "#60a5fa", r: 3, strokeWidth: 0 }}
        />
        <Tooltip
          formatter={(
            value: number | string | (string | number)[] | undefined
          ) => [`${value ?? "?"}%`, "Mastery"]}
          contentStyle={{
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "10px",
            color: "#fafafa",
            fontSize: "12px",
            boxShadow: "none",
          }}
          labelStyle={{ color: "#a1a1aa" }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
