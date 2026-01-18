"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  AlertCircle,
  TrendingUp,
  History,
  X,
  Columns2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { StockKPIs } from "../components/StockKPIS";
import { StockChart } from "../components/StockChart";
import { SkeletonLoader } from "../components/SkeletonLoader";
import { ComparePanel } from "../components/ComparePanel";
import { StockData, ApiError } from "../types";
import { buildStockUrl } from "../lib/api";
import {
  clearRecentTickers,
  loadRecentTickers,
  saveRecentTicker,
} from "../lib/storage";
import {
  addToWatchlist,
  clearWatchlist,
  loadWatchlist,
  removeFromWatchlist,
  toggleWatchlist,
} from "../lib/watchlist";
import {
  Currency,
  currencySymbol,
  loadCurrency,
  saveCurrency,
} from "../lib/currency";
const USD_TO_BRL = 5.0;

export default function Home() {
  const [ticker, setTicker] = useState("");
  const [compareTicker, setCompareTicker] = useState("");
  const [period, setPeriod] = useState("1mo");

  const [stockData, setStockData] = useState<StockData | null>(null);
  const [compareData, setCompareData] = useState<StockData | null>(null);

  const [loading, setLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);

  const [error, setError] = useState("");
  const [compareError, setCompareError] = useState("");

  const [recent, setRecent] = useState<string[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  const [currency, setCurrency] = useState<Currency>("USD");
  const [backendOnline, setBackendOnline] = useState(true);

  const [showSuggest, setShowSuggest] = useState(false);

  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setRecent(loadRecentTickers());
    setWatchlist(loadWatchlist());
    setCurrency(loadCurrency());
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const el = boxRef.current;
      if (!el) return;
      if (!el.contains(e.target as any)) setShowSuggest(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const normalizedTicker = useMemo(() => ticker.trim().toUpperCase(), [ticker]);
  const normalizedCompare = useMemo(
    () => compareTicker.trim().toUpperCase(),
    [compareTicker],
  );

  const moneyPrefix = currencySymbol(currency);

  const suggestions = useMemo(() => {
    const q = normalizedTicker;
    const source = Array.from(new Set([...watchlist, ...recent]));
    if (!q) return source.slice(0, 8);
    return source.filter((t) => t.includes(q)).slice(0, 8);
  }, [normalizedTicker, recent, watchlist]);

  function setOnline(ok: boolean) {
    setBackendOnline(ok);
  }

  function getErrorMessage(status: number, apiError: ApiError | null) {
    if (apiError?.error?.message) return apiError.error.message;
    if (status === 404) return "Ticker not found. Try another symbol.";
    if (status === 503)
      return "Data provider unavailable. Try again in a few seconds.";
    if (status === 422) return "Invalid input.";
    return "Unexpected server error.";
  }

  async function fetchOne(t: string, p: string) {
    const response = await fetch(buildStockUrl(t, p));
    if (!response.ok) {
      const maybeJson = (await response
        .json()
        .catch(() => null)) as ApiError | null;
      throw new Error(getErrorMessage(response.status, maybeJson));
    }
    return (await response.json()) as StockData;
  }

  async function fetchPrimary(customTicker?: string, customPeriod?: string) {
    const p = customPeriod || period;
    const t = (customTicker ?? ticker).trim().toUpperCase();
    if (!t) return;

    setLoading(true);
    setError("");

    try {
      const data = await fetchOne(t, p);
      setOnline(true);
      setStockData(data);

      saveRecentTicker(t);
      setRecent(loadRecentTickers());
      setTicker(t);
    } catch (err: any) {
      setOnline(false);
      setStockData(null);
      setError(err?.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCompare(customCompare?: string, customPeriod?: string) {
    const p0 = customPeriod || period;
    const p = p0 === "max" ? "5y" : p0;
    const t = (customCompare ?? compareTicker).trim().toUpperCase();

    if (!t) {
      setCompareData(null);
      setCompareError("");
      return;
    }

    setCompareLoading(true);
    setCompareError("");

    try {
      const data = await fetchOne(t, p);
      setOnline(true);
      setCompareData(data);
      setCompareTicker(t);
    } catch (err: any) {
      setOnline(false);
      setCompareData(null);
      setCompareError(err?.message || "Unexpected error.");
    } finally {
      setCompareLoading(false);
    }
  }

  async function fetchBoth() {
    await fetchPrimary();
    if (normalizedCompare) await fetchCompare();
    else {
      setCompareData(null);
      setCompareError("");
    }
  }

  function handlePeriodChange(newPeriod: string) {
    setPeriod(newPeriod);

    if (stockData) fetchPrimary(stockData.ticker, newPeriod);
    if (compareData) fetchCompare(compareData.ticker, newPeriod);
  }

  function handleClearRecent() {
    clearRecentTickers();
    setRecent([]);
  }

  function handleToggleCurrency() {
    const next: Currency = currency === "USD" ? "BRL" : "USD";
    setCurrency(next);
    saveCurrency(next);
  }

  function applyCurrencyToData(d: StockData): StockData {
    const factor = currency === "USD" ? 1 : USD_TO_BRL;

    return {
      ...d,
      current_price: d.current_price * factor,
      high: d.high * factor,
      low: d.low * factor,
      period_start_price: d.period_start_price * factor,
      period_end_price: d.period_end_price * factor,
      history: d.history.map((p) => ({ ...p, close: p.close * factor })),
    };
  }

  const hasPrimary = !!stockData && !loading && !error;
  const isEmptyState = !stockData && !loading && !error;
  const hasComparePanel =
    hasPrimary && !!compareData && !compareLoading && !compareError;

  const effectivePrimary = stockData ? applyCurrencyToData(stockData) : null;
  const effectiveCompare = compareData
    ? applyCurrencyToData(compareData)
    : null;

  const primaryFavorite = effectivePrimary
    ? watchlist.includes(effectivePrimary.ticker)
    : false;

  function toggleFavorite() {
    if (!effectivePrimary) return;
    toggleWatchlist(effectivePrimary.ticker);
    setWatchlist(loadWatchlist());
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto p-8 space-y-6 relative z-10">
        <header className="glass-card p-4 rounded-2xl border border-white/10">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  InvestDash
                </h1>
                <div className="text-xs text-gray-500">
                  Compare performance and risk metrics
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-2 ${
                  backendOnline
                    ? "bg-green-500/10 border-green-500/20 text-green-300"
                    : "bg-red-500/10 border-red-500/20 text-red-300"
                }`}
              >
                {backendOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                {backendOnline ? "Backend online" : "Backend offline"}
              </div>

              <button
                onClick={handleToggleCurrency}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-200 hover:bg-white/10 transition"
              >
                {currency === "USD" ? "USD" : "BRL"}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col md:flex-row w-full gap-2">
            <div className="relative flex-1 md:w-72" ref={boxRef}>
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Primary (e.g. BTC-USD, AAPL)"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600 text-sm"
                value={ticker}
                onChange={(e) => {
                  setTicker(e.target.value);
                  setShowSuggest(true);
                }}
                onFocus={() => setShowSuggest(true)}
                onBlur={() => {
                  if (normalizedTicker) setTicker(normalizedTicker);
                }}
                onKeyDown={(e) => e.key === "Enter" && fetchBoth()}
              />
              {ticker && (
                <button
                  onClick={() => setTicker("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  aria-label="Clear input"
                >
                  <X size={16} />
                </button>
              )}

              {showSuggest && suggestions.length > 0 && (
                <div className="absolute mt-2 w-full rounded-2xl bg-[#0f0f0f] border border-white/10 shadow-xl overflow-hidden z-50">
                  <div className="px-3 py-2 text-xs text-gray-500 border-b border-white/10">
                    Suggestions
                  </div>
                  <div className="max-h-60 overflow-auto">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setTicker(s);
                          setShowSuggest(false);
                          fetchPrimary(s);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/5 transition"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative flex-1 md:w-72">
              <Columns2
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Compare with (optional)"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600 text-sm"
                value={compareTicker}
                onChange={(e) => setCompareTicker(e.target.value)}
                onBlur={() => {
                  if (normalizedCompare) setCompareTicker(normalizedCompare);
                }}
                onKeyDown={(e) => e.key === "Enter" && fetchBoth()}
              />
              {compareTicker && (
                <button
                  onClick={() => {
                    setCompareTicker("");
                    setCompareData(null);
                    setCompareError("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  aria-label="Clear compare input"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              onClick={() => fetchBoth()}
              disabled={loading || !normalizedTicker}
              className="px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-white/10"
            >
              {loading ? "..." : "Search"}
            </button>
          </div>
        </header>

        {watchlist.length > 0 && (
          <div className="glass-card border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-gray-300">
                <span className="font-semibold">Watchlist</span>{" "}
                <span className="text-gray-500">click to load</span>
              </div>

              <button
                onClick={() => {
                  clearWatchlist();
                  setWatchlist([]);
                }}
                className="text-xs text-gray-500 hover:text-gray-300 transition"
              >
                Clear
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {watchlist.map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTicker(t);
                      fetchPrimary(t);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-200 hover:bg-white/10 transition"
                  >
                    {t}
                  </button>
                  <button
                    onClick={() => {
                      removeFromWatchlist(t);
                      setWatchlist(loadWatchlist());
                    }}
                    className="px-2 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {recent.length > 0 && (
          <div className="glass-card border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <History size={16} className="text-gray-500" />
                <span className="font-semibold">Recent</span>
                <span className="text-gray-500">click to load</span>
              </div>

              <button
                onClick={handleClearRecent}
                className="text-xs text-gray-500 hover:text-gray-300 transition"
              >
                Clear
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {recent.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTicker(t);
                    fetchPrimary(t);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-200 hover:bg-white/10 transition"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="glass-card border border-white/10 p-4 rounded-2xl flex items-start gap-3">
            <div className="bg-red-500/15 rounded-xl p-2 mt-0.5">
              <AlertCircle size={18} className="text-red-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-100">
                Primary request failed
              </div>
              <div className="text-sm text-gray-400">{error}</div>
            </div>
          </div>
        )}

        {compareError && (
          <div className="glass-card border border-white/10 p-4 rounded-2xl flex items-start gap-3">
            <div className="bg-amber-500/15 rounded-xl p-2 mt-0.5">
              <AlertCircle size={18} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-100">
                Compare request failed
              </div>
              <div className="text-sm text-gray-400">{compareError}</div>
            </div>
          </div>
        )}

        {(loading || compareLoading) && <SkeletonLoader />}

        {isEmptyState && (
          <div className="glass-card p-8 rounded-2xl border border-white/10">
            <div className="text-lg font-semibold text-gray-100">Ready</div>
            <div className="text-sm text-gray-400">
              Search a ticker. Add a second ticker to compare.
            </div>
          </div>
        )}

        {hasPrimary && effectivePrimary && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <StockKPIs
              data={effectivePrimary}
              moneyPrefix={moneyPrefix}
              isFavorite={primaryFavorite}
              onToggleFavorite={toggleFavorite}
            />

            {hasComparePanel && effectiveCompare && (
              <ComparePanel
                primary={effectivePrimary}
                secondary={effectiveCompare}
                period={period}
              />
            )}

            <StockChart
              data={effectivePrimary}
              compareData={effectiveCompare}
              period={period}
              onPeriodChange={handlePeriodChange}
              moneyPrefix={moneyPrefix}
            />
          </div>
        )}
      </div>
    </div>
  );
}
