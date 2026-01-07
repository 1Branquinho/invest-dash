import { ArrowUp, ArrowDown } from "lucide-react";
import { StockData } from "../types";

interface Props {
  data: StockData;
}

export function StockKPIs({ data }: Props) {
  const isPositive = data.change_percent >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
        <p className="text-gray-400 text-sm font-medium mb-1">Current Price</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">R$ {data.current_price}</span>
          <span
            className={`flex items-center text-sm font-bold ${
              isPositive ? "text-green-400" : "text-red-400"
            }`}
          >
            {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            {Math.abs(data.change_percent)}%
          </span>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <p className="text-gray-400 text-sm font-medium mb-1">Period High</p>
        <span className="text-2xl font-semibold text-gray-200">
          R$ {data.high}
        </span>
      </div>

      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <p className="text-gray-400 text-sm font-medium mb-1">Period Low</p>
        <span className="text-2xl font-semibold text-gray-200">
          R$ {data.low}
        </span>
      </div>
    </div>
  );
}
