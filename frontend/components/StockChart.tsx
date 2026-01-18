import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Download } from "lucide-react";
import { StockData } from "../types";

type Props = {
  data: StockData;
  compareData?: StockData | null;
  period: string;
  onPeriodChange: (p: string) => void;
  moneyPrefix: string;
};

type MergedPoint = {
  date: string;
  primary?: number;
  secondary?: number;
};

function mergeSeries(
  primary: StockData,
  secondary?: StockData | null,
): MergedPoint[] {
  const map = new Map<string, MergedPoint>();

  for (const p of primary.history) {
    map.set(p.date, { date: p.date, primary: p.close });
  }

  if (secondary) {
    for (const p of secondary.history) {
      const existing = map.get(p.date);
      if (existing) existing.secondary = p.close;
      else map.set(p.date, { date: p.date, secondary: p.close });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function downloadCSV(filename: string, rows: string[][]) {
  const content = rows
    .map((r) => r.map((c) => `"${String(c).replaceAll(`"`, `""`)}"`).join(","))
    .join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function StockChart({
  data,
  compareData,
  period,
  onPeriodChange,
  moneyPrefix,
}: Props) {
  const isPositive = data.change_percent >= 0;
  const trendColor = isPositive ? "#22c55e" : "#ef4444";
  const compareColor = "#60a5fa";

  const merged = mergeSeries(data, compareData);

  function handleExport() {
    const header = [
      "date",
      data.ticker,
      compareData ? compareData.ticker : "",
    ].filter((x) => x !== "");
    const rows: string[][] = [header];

    for (const p of merged) {
      const r: string[] = [p.date];
      r.push(typeof p.primary === "number" ? String(p.primary) : "");
      if (compareData)
        r.push(typeof p.secondary === "number" ? String(p.secondary) : "");
      rows.push(r);
    }

    const name = compareData
      ? `${data.ticker}_vs_${compareData.ticker}_${period}.csv`
      : `${data.ticker}_${period}.csv`;
    downloadCSV(name, rows);
  }

  return (
    <div className="p-6 rounded-2xl glass-card border border-white/10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          {data.logo && (
            <img
              src={data.logo}
              alt={`${data.name} logo`}
              className="w-10 h-10 rounded-full bg-white object-contain p-0.5"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold">{data.ticker}</h2>
            <div className="text-sm text-gray-400 font-medium">{data.name}</div>
            {compareData && (
              <div className="text-xs text-gray-500 mt-1">
                Overlay: {data.ticker} + {compareData.ticker}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-200 hover:bg-white/10 transition flex items-center gap-2"
          >
            <Download size={16} />
            Export CSV
          </button>

          <div className="flex bg-black/20 p-1 rounded-lg overflow-x-auto">
            {["5d", "1mo", "6mo", "1y", "5y", "max"].map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  period === p
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={merged}>
            <defs>
              <linearGradient id="primaryFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={trendColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="secondaryFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={compareColor} stopOpacity={0.18} />
                <stop offset="95%" stopColor={compareColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ffffff10"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              stroke="#525252"
              tick={{ fontSize: 12 }}
              tickFormatter={(val) => {
                const d = new Date(val);
                return period === "5d" || period === "1mo"
                  ? `${d.getDate()}/${d.getMonth() + 1}`
                  : `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
              }}
              tickMargin={10}
            />

            <YAxis
              stroke="#525252"
              tickFormatter={(val) => `${moneyPrefix}${val}`}
              domain={["auto", "auto"]}
              tick={{ fontSize: 12 }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#171717",
                border: "1px solid #333",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "#fff" }}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
              formatter={(value: any, name: any) => [
                `${moneyPrefix}${Number(value).toFixed(2)}`,
                String(name),
              ]}
            />

            <Area
              type="monotone"
              dataKey="primary"
              name={data.ticker}
              stroke={trendColor}
              fillOpacity={1}
              fill="url(#primaryFill)"
              strokeWidth={2}
              connectNulls
            />

            {compareData && (
              <Area
                type="monotone"
                dataKey="secondary"
                name={compareData.ticker}
                stroke={compareColor}
                fillOpacity={1}
                fill="url(#secondaryFill)"
                strokeWidth={2}
                connectNulls
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
