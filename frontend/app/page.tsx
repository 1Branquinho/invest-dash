"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Home() {
  const [ticker, setTicker] = useState("");
  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function fetchStock() {
    if (!ticker) return;
    setLoading(true);
    setStockData(null);
    try {
      const response = await fetch(`http://localhost:8000/stock/${ticker}`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setStockData(data);
    } catch (error) {
      console.error(error);
      alert("Error fetching stock.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-blue-500">InvestDash</h1>

        <div className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="Enter ticker (e.g. PETR4.SA)"
            className="flex-1 p-4 rounded-lg bg-gray-900 border border-gray-800 text-white focus:outline-none focus:border-blue-500 transition-all"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchStock()}
          />
          <button
            onClick={fetchStock}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-bold transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>

        {stockData && (
          <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">
                {stockData.ticker}
              </h2>
              <span className="text-gray-400">Last 30 Days Trend</span>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stockData.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      value.split("-").slice(1).join("/")
                    }
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    domain={["auto", "auto"]}
                    tickFormatter={(value) => `R$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "#60A5FA" }}
                    labelStyle={{ color: "#9CA3AF" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
