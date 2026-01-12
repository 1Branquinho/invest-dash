import yfinance as yf

def fetch_history(ticker: str, period: str):
    stock = yf.Ticker(ticker)
    history = stock.history(period=period, interval="1d", auto_adjust=False, actions=False)
    return stock, history
