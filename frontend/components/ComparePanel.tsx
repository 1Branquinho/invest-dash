import { StockData } from "../types";
import { TrendingUp, TrendingDown, Activity, ShieldAlert } from "lucide-react";
import { formatPercent, daysBetween, cagrPercent } from "../lib/format";

type Props = {
  primary: StockData;
  secondary: StockData;
  period: string;
};

export function ComparePanel({ primary, secondary, period }: Props) {
  const days = daysBetween(primary.period_start_date, primary.period_end_date);
  const pCagr = cagrPercent(
    primary.period_start_price,
    primary.period_end_price,
    days,
  );
  const sCagr = cagrPercent(
    secondary.period_start_price,
    secondary.period_end_price,
    days,
  );

  const pRet = primary.period_return_percent;
  const sRet = secondary.period_return_percent;

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Comparison
          </div>
          <div className="text-lg font-semibold text-gray-100">
            {primary.ticker} vs {secondary.ticker}
          </div>
          <div className="text-sm text-gray-400">
            {primary.period_start_date} → {primary.period_end_date} ·{" "}
            {period.toUpperCase()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            CAGR/yr: {primary.ticker} {formatPercent(pCagr)} ·{" "}
            {secondary.ticker} {formatPercent(sCagr)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="text-xs text-gray-500">{primary.ticker}</div>
            <div className="text-sm text-gray-200 font-semibold">
              {primary.name}
            </div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="text-xs text-gray-500">{secondary.ticker}</div>
            <div className="text-sm text-gray-200 font-semibold">
              {secondary.name}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-3">
        <div className="rounded-xl bg-black/30 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Period Return
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              {pRet >= 0 || sRet >= 0 ? (
                <TrendingUp size={16} className="text-gray-200" />
              ) : (
                <TrendingDown size={16} className="text-gray-200" />
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="text-xs text-gray-500">{primary.ticker}</div>
              <div
                className={`mt-1 text-2xl font-bold ${pRet >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {formatPercent(pRet)}
              </div>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="text-xs text-gray-500">{secondary.ticker}</div>
              <div
                className={`mt-1 text-2xl font-bold ${sRet >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {formatPercent(sRet)}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-black/30 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Max Drawdown
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <ShieldAlert size={16} className="text-red-400" />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="text-xs text-gray-500">{primary.ticker}</div>
              <div className="mt-1 text-2xl font-bold text-red-400">
                {formatPercent(primary.max_drawdown_percent)}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {primary.max_drawdown_peak_date} →{" "}
                {primary.max_drawdown_trough_date}
              </div>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="text-xs text-gray-500">{secondary.ticker}</div>
              <div className="mt-1 text-2xl font-bold text-red-400">
                {formatPercent(secondary.max_drawdown_percent)}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {secondary.max_drawdown_peak_date} →{" "}
                {secondary.max_drawdown_trough_date}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-black/30 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Volatility
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <Activity size={16} className="text-gray-200" />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="text-xs text-gray-500">{primary.ticker}</div>
              <div className="mt-1 text-2xl font-bold text-gray-100">
                {formatPercent(primary.volatility_percent)}
              </div>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="text-xs text-gray-500">{secondary.ticker}</div>
              <div className="mt-1 text-2xl font-bold text-gray-100">
                {formatPercent(secondary.volatility_percent)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
