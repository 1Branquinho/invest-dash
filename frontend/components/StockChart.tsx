import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { StockData } from "../types";

interface Props {
  data: StockData;
  period: string;
  onPeriodChange: (p: string) => void;
}

export function StockChart({ data, period, onPeriodChange }: Props) {
  const isPositive = data.change_percent >= 0;
  const trendColor = isPositive ? "#22c55e" : "#ef4444";

  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            {data.logo && (
              <img
                src={data.logo}
                alt={`${data.name} logo`}
                className="w-10 h-10 rounded-full bg-white object-contain p-0.5"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold flex items-baseline gap-2">
                {data.ticker}
              </h2>
              <span className="text-sm text-gray-400 font-medium">
                {data.name}
              </span>
            </div>
          </div>
        </div>

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

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.history}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={trendColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
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
                  : `${d.getMonth() + 1}/${d
                      .getFullYear()
                      .toString()
                      .slice(2)}`;
              }}
              tickMargin={10}
            />
            <YAxis
              stroke="#525252"
              tickFormatter={(val) => `R$${val}`}
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
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={trendColor}
              fillOpacity={1}
              fill="url(#colorPrice)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
