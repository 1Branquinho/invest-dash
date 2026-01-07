"use client";

import { useState } from "react";

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
      if (!response.ok) {
        throw new Error("Falha na requisição");
      }
      const data = await response.json();
      setStockData(data);
    } catch (error) {
      console.error("Error fetching stock:", error);
      alert(
        "Erro ao buscar. O Backend está rodando? O código da ação está certo?"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-blue-500">InvestDash</h1>

        <div className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="Digite o código (Ex: PETR4.SA, AAPL)"
            className="flex-1 p-4 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchStock()}
          />
          <button
            onClick={fetchStock}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-bold transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {stockData && (
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
            <h2 className="text-3xl font-bold mb-6 text-green-400">
              {stockData.ticker}
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-gray-400 border-b border-gray-700 pb-2 mb-2">
                <span>Data</span>
                <span>Fechamento</span>
              </div>

              {stockData.history
                .slice(-5)
                .reverse()
                .map((day: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center hover:bg-gray-700 p-2 rounded transition-colors"
                  >
                    <span className="text-gray-300">{day.date}</span>
                    <span className="font-mono text-xl font-semibold text-white">
                      R$ {day.close.toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
