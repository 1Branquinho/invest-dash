"use client";

import { useState } from "react";
import { Search, AlertCircle, TrendingUp } from "lucide-react";
import { StockKPIs } from "@/components/StockKPIS";
import { StockChart } from "@/components/StockChart";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { StockData } from "@/types";

export default function Home() {
  const [ticker, setTicker] = useState("");
  const [period, setPeriod] = useState("1mo");
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchStock(customPeriod?: string) {
    const periodToUse = customPeriod || period;
    if (!ticker.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:8000/stock/${ticker}?period=${periodToUse}`
      );

      if (response.status === 404) throw new Error("Ticker not found.");
      if (!response.ok) throw new Error("Server error.");

      const data = await response.json();
      setStockData(data);
    } catch (err: any) {
      setStockData(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handlePeriodChange(newPeriod: string) {
    setPeriod(newPeriod);
    if (stockData) {
      fetchStock(newPeriod);
    }
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto p-8 space-y-8 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 glass-card p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              InvestDash
            </h1>
          </div>

          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-80">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search ticker (e.g. BTC-USD, NVDA)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600 text-sm"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchStock()}
              />
            </div>
            <button
              onClick={() => fetchStock()}
              disabled={loading}
              className="px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-white/10"
            >
              {loading ? "..." : "Search"}
            </button>
          </div>
        </header>

        {error && (
          <div className="glass-card border-l-4 border-l-red-500 text-red-400 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {loading && <SkeletonLoader />}

        {!loading && stockData && !error && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <StockKPIs data={stockData} />

            <StockChart
              data={stockData}
              period={period}
              onPeriodChange={handlePeriodChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
