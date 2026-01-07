export interface StockHistory {
  date: string;
  close: number;
}

export interface StockData {
  ticker: string;
  name: string; 
  current_price: number;
  change_percent: number;
  high: number;
  low: number;
  history: StockHistory[];
}