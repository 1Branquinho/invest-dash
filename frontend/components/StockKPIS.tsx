import { StockData } from "../types";

type Props = {
  data: StockData;
};

function formatPercent(v: number) {
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

function formatMoney(v: number) {
  return `$${v.toFixed(2)}`;
}

export function StockKPIs({ data }: Props) {
  const isReturnPositive = data.period_return_percent >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="glass-card p-5 rounded-xl">
        <div className="text-sm text-gray-400">Current Price</div>
        <div className="text-2xl font-bold">
          {formatMoney(data.current_price)}
        </div>
        <div className="text-sm text-gray-500">
          Daily: {formatPercent(data.change_percent)}
        </div>
      </div>

      <div className="glass-card p-5 rounded-xl">
        <div className="text-sm text-gray-400">Period Return</div>
        <div
          className={`text-2xl font-bold ${
            isReturnPositive ? "text-green-400" : "text-red-400"
          }`}
        >
          {formatPercent(data.period_return_percent)}
        </div>
        <div className="text-sm text-gray-500">
          {data.period_start_date} → {data.period_end_date}
        </div>
      </div>

      <div className="glass-card p-5 rounded-xl">
        <div className="text-sm text-gray-400">Max Drawdown</div>
        <div className="text-2xl font-bold text-red-400">
          {formatPercent(data.max_drawdown_percent)}
        </div>
        <div className="text-sm text-gray-500">
          Peak {data.max_drawdown_peak_date} → Trough{" "}
          {data.max_drawdown_trough_date}
        </div>
      </div>

      <div className="glass-card p-5 rounded-xl">
        <div className="text-sm text-gray-400">Period Range</div>
        <div className="text-2xl font-bold">
          {formatMoney(data.low)} – {formatMoney(data.high)}
        </div>
        <div className="text-sm text-gray-500">
          Start {formatMoney(data.period_start_price)} | End{" "}
          {formatMoney(data.period_end_price)}
        </div>
      </div>
    </div>
  );
}
