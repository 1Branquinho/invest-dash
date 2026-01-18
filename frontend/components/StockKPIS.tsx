import { TrendingUp, ShieldAlert, Activity, ArrowUpRight } from "lucide-react";
import { StockData } from "../types";
import {
  formatMoney,
  formatPercent,
  daysBetween,
  cagrPercent,
} from "../lib/format";

type Props = {
  data: StockData;
};

export function StockKPIs({ data }: Props) {
  const days = daysBetween(data.period_start_date, data.period_end_date);
  const cagr = cagrPercent(
    data.period_start_price,
    data.period_end_price,
    days,
  );

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/10">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <TrendingUp size={20} className="text-gray-200" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Asset
            </div>
            <div className="text-xl font-bold text-gray-100">{data.ticker}</div>
            <div className="text-sm text-gray-400">{data.name}</div>
          </div>
        </div>

        <div className="rounded-2xl bg-black/30 border border-white/10 p-4 min-w-[280px]">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Current Price
          </div>
          <div className="mt-1 text-4xl font-extrabold text-gray-100">
            {formatMoney(data.current_price)}
          </div>
          <div
            className={`mt-1 text-sm ${data.change_percent >= 0 ? "text-green-400" : "text-red-400"}`}
          >
            Daily: {formatPercent(data.change_percent)}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Period Return
            </div>
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <ArrowUpRight size={16} className="text-gray-200" />
            </div>
          </div>

          <div
            className={`mt-2 text-3xl font-bold ${data.period_return_percent >= 0 ? "text-green-400" : "text-red-400"}`}
          >
            {formatPercent(data.period_return_percent)}
          </div>

          <div className="mt-2 text-sm text-gray-400">
            {data.period_start_date} → {data.period_end_date}
          </div>

          <div className="mt-2 text-sm text-gray-400">
            Start {formatMoney(data.period_start_price)} · End{" "}
            {formatMoney(data.period_end_price)}
          </div>

          <div className="mt-1 text-xs text-gray-500">
            CAGR/yr: {formatPercent(cagr)}
          </div>
        </div>

        <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Max Drawdown
            </div>
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <ShieldAlert size={16} className="text-red-400" />
            </div>
          </div>

          <div className="mt-2 text-3xl font-bold text-red-400">
            {formatPercent(data.max_drawdown_percent)}
          </div>

          <div className="mt-2 text-sm text-gray-400">
            Peak {data.max_drawdown_peak_date} → Trough{" "}
            {data.max_drawdown_trough_date}
          </div>

          <div className="mt-2 text-xs text-gray-500">
            Worst peak-to-trough loss in period
          </div>
        </div>

        <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Volatility
            </div>
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <Activity size={16} className="text-gray-200" />
            </div>
          </div>

          <div className="mt-2 text-3xl font-bold text-gray-100">
            {formatPercent(data.volatility_percent)}
          </div>

          <div className="mt-2 text-sm text-gray-400">
            Std dev of daily returns
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Higher means more price variability
          </div>
        </div>

        <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Period Range
            </div>
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <TrendingUp size={16} className="text-gray-200" />
            </div>
          </div>

          <div className="mt-2 text-3xl font-bold text-gray-100">
            {formatMoney(data.low)} — {formatMoney(data.high)}
          </div>

          <div className="mt-2 text-sm text-gray-400">Low → High in period</div>
          <div className="mt-1 text-xs text-gray-500">
            Useful for range context
          </div>
        </div>
      </div>
    </div>
  );
}
