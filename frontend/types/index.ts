export interface StockHistoryPoint {
  date: string;
  close: number;
}

export interface StockData {
  ticker: string;
  name: string;
  logo: string;

  current_price: number;
  change_percent: number;

  period_return_percent: number;
  period_start_date: string;
  period_end_date: string;
  period_start_price: number;
  period_end_price: number;

  max_drawdown_percent: number;
  max_drawdown_peak_date: string;
  max_drawdown_trough_date: string;

  volatility_percent: number;

  high: number;
  low: number;

  history: StockHistoryPoint[];
}

export interface ApiError {
  error?: {
    message?: string;
  };
}
