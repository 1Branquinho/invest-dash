import { StockData } from "../types";
import { TrendingUp, TrendingDown, Activity, ShieldAlert } from "lucide-react";

type Props = {
  data: StockData;
};

function formatPercent(v?: number | null) {
  if (typeof v !== "number" || Number.isNaN(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

function formatMoney(v: number) {
  return `$${v.toFixed(2)}`;
}

function formatDateRange(start: string, end: string) {
  return `${start} → ${end}`;
}

export function StockKPIs({ data }: Props) {
  const isDailyPositive = data.change_percent >= 0;
  const isReturnPositive = data.period_return_percent >= 0;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 rounded-xl p-2">
            {isReturnPositive ? (
              <TrendingUp size={18} className="text-green-400" />
            ) : (
              <TrendingDown size={18} className="text-red-400" />
            )}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Asset</div>
            <div className="text-lg font-semibold text-gray-100">{data.ticker}</div>
            <div className="text-sm text-gray-400">{data.name}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-8">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Current Price</div>
            <div className="text-3xl font-bold text-gray-100">{formatMoney(data.current_price)}</div>
            <div className={`text-sm ${isDailyPositive ? "text-green-400" : "text-red-400"}`}>
              Daily: {formatPercent(data.change_percent)}
            </div>
          </div>

          <div className="flex gap-4">
            {data.logo ? (
              <img
                src={data.logo}
                alt={`${data.name} logo`}
                className="w-12 h-12 rounded-2xl bg-white object-contain p-1"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-white/10" />
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="rounded-xl bg-black/30 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-gray-500">Period Return</div>
            <div className="bg-white/5 rounded-lg p-2">
              {isReturnPositive ? (
                <TrendingUp size={16} className="text-green-400" />
              ) : (
                <TrendingDown size={16} className="text-red-400" />
              )}
            </div>
          </div>
          <div className={`mt-2 text-2xl font-bold ${isReturnPositive ? "text-green-400" : "text-red-400"}`}>
            {formatPercent(data.period_return_percent)}
          </div>
          <div className="mt-1 text-sm text-gray-500">{formatDateRange(data.period_start_date, data.period_end_date)}</div>
          <div className="mt-2 text-sm text-gray-400">
            Start {formatMoney(data.period_start_price)} · End {formatMoney(data.period_end_price)}
          </div>
        </div>

        <div className="rounded-xl bg-black/30 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-gray-500">Max Drawdown</div>
            <div className="bg-white/5 rounded-lg p-2">
              <ShieldAlert size={16} className="text-red-400" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-red-400">{formatPercent(data.max_drawdown_percent)}</div>
          <div className="mt-1 text-sm text-gray-500">
            Peak {data.max_drawdown_peak_date} → Trough {data.max_drawdown_trough_date}
          </div>
          <div className="mt-2 text-sm text-gray-400">Worst peak-to-trough loss in period</div>
        </div>

        <div className="rounded-xl bg-black/30 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-gray-500">Volatility</div>
            <div className="bg-white/5 rounded-lg p-2">
              <Activity size={16} className="text-gray-200" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-100">{formatPercent(data.volatility_percent)}</div>
          <div className="mt-1 text-sm text-gray-500">Std dev of daily returns</div>
          <div className="mt-2 text-sm text-gray-400">Higher means more price variability</div>
        </div>

        <div className="rounded-xl bg-black/30 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-gray-500">Period Range</div>
            <div className="bg-white/5 rounded-lg p-2">
              <TrendingUp size={16} className="text-gray-200" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-100">
            {formatMoney(data.low)} – {formatMoney(data.high)}
          </div>
          <div className="mt-1 text-sm text-gray-500">Low → High in period</div>
          <div className="mt-2 text-sm text-gray-400">Useful for range context</div>
        </div>
      </div>
    </div>
  );
}
