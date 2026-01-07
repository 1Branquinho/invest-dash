export interface StockHistory {
  date: string;
  close: number;
}

export interface NewsItem {
  title: string;
  publisher: string;
  link: string;
  thumbnail: string;
}

export interface StockData {
  ticker: string;
  name: string;
  logo: string;
  current_price: number;
  change_percent: number;
  high: number;
  low: number;
  history: {
    date: string;
    close: number;
  }[];
}
