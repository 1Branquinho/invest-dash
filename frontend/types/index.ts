export type StockHistoryPoint = {
  date: string;
  close: number;
};

export type StockData = {
  ticker: string;
  name: string;
  logo: string;
  current_price: number;
  change_percent: number;
  high: number;
  low: number;
  period: "5d" | "1mo" | "6mo" | "1y" | "5y" | "max";
  period_start_date: string;
  period_end_date: string;
  period_start_price: number;
  period_end_price: number;
  period_return_percent: number;
  max_drawdown_percent: number;
  max_drawdown_peak_date: string;
  max_drawdown_trough_date: string;
  history: StockHistoryPoint[];
};

export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};
