"use client";

import { useState } from "react";
import { Search, AlertCircle } from "lucide-react";
import { StockKPIs } from "@/components/StockKPIS";
import { StockChart } from "../components/StockChart";
import { SkeletonLoader } from "../components/SkeletonLoader";
import { StockData } from "../types";

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

      if (response.status === 404)
        throw new Error("Ticker not found. Please check the code.");
      if (!response.ok) throw new Error("Failed to connect to the server.");

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
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            InvestDash
          </h1>

          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search ticker (e.g. AAPL)"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchStock()}
              />
            </div>
            <button
              onClick={() => fetchStock()}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "Search"}
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {loading && <SkeletonLoader />}

        {!loading && stockData && !error && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
