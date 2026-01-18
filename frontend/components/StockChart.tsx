import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import { StockData } from "../types";

type Props = {
  data: StockData;
  period: string;
  onPeriodChange: (p: string) => void;
};

function formatMoney(v: number) {
  return `$${v.toFixed(2)}`;
}

function formatPercent(v: number) {
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

function toShortDate(label: string, period: string) {
  const d = new Date(label);
  if (period === "5d" || period === "1mo") return `${d.getDate()}/${d.getMonth() + 1}`;
  return `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
}

function findPoint(history: { date: string; close: number }[], date: string) {
  return history.find((p) => p.date === date) || null;
}

export function StockChart({ data, period, onPeriodChange }: Props) {
  const isPositive = data.change_percent >= 0;
  const trendColor = isPositive ? "#22c55e" : "#ef4444";

  const peakPoint = findPoint(data.history, data.max_drawdown_peak_date);
  const troughPoint = findPoint(data.history, data.max_drawdown_trough_date);

  const firstClose = data.history.length ? data.history[0].close : 0;

  return (
    <div className="p-6 rounded-2xl glass-card">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-200">{data.ticker.slice(0, 2)}</span>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Price Chart</div>
            <div className="text-lg font-semibold text-gray-100">
              {data.ticker} · {period.toUpperCase()}
            </div>
            <div className="text-sm text-gray-400">
              {data.period_start_date} → {data.period_end_date}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="text-sm text-gray-400">
            Showing last <span className="text-gray-200 font-semibold">{period.toUpperCase()}</span> of data
          </div>

          <div className="flex bg-black/20 p-1 rounded-xl overflow-x-auto border border-white/10">
            {["5d", "1mo", "6mo", "1y", "5y", "max"].map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  period === p
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
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
          <AreaChart data={data.history}>
            <defs>
              <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={trendColor} stopOpacity={0.28} />
                <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />

            <XAxis
              dataKey="date"
              stroke="#525252"
              tick={{ fontSize: 12 }}
              tickFormatter={(val) => toShortDate(val, period)}
              tickMargin={10}
            />

            <YAxis
              stroke="#525252"
              tickFormatter={(val) => `$${val}`}
              domain={["auto", "auto"]}
              tick={{ fontSize: 12 }}
              width={70}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#0b0b0b",
                border: "1px solid #262626",
                borderRadius: "12px",
              }}
              itemStyle={{ color: "#fff" }}
              labelStyle={{ color: "#a3a3a3" }}
              formatter={(value: any, name: any, props: any) => {
                const close = Number(value);
                const ret = firstClose ? ((close / firstClose) - 1) * 100 : 0;
                return [
                  `${formatMoney(close)} · ${formatPercent(ret)}`,
                  "Close",
                ];
              }}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />

            {data.period_start_date ? (
              <ReferenceLine x={data.period_start_date} stroke="#ffffff14" strokeDasharray="4 4" />
            ) : null}

            {peakPoint ? (
              <ReferenceDot
                x={peakPoint.date}
                y={peakPoint.close}
                r={5}
                fill="#f59e0b"
                stroke="#0b0b0b"
                strokeWidth={2}
              />
            ) : null}

            {troughPoint ? (
              <ReferenceDot
                x={troughPoint.date}
                y={troughPoint.close}
                r={5}
                fill="#ef4444"
                stroke="#0b0b0b"
                strokeWidth={2}
              />
            ) : null}

            <Area
              type="monotone"
              dataKey="close"
              stroke={trendColor}
              fill="url(#priceFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-gray-400">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Drawdown Peak</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Drawdown Trough</span>
          </div>
        </div>

        <div className="text-gray-500">
          Tooltip shows close price and cumulative return from period start
        </div>
      </div>
    </div>
  );
}
