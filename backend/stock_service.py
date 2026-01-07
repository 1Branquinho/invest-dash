import yfinance as yf

def fetch_stock_data(ticker: str, period: str):
    stock = yf.Ticker(ticker)
    
    
    history = stock.history(period=period)
    
    if history.empty:
        return None

    
    try:
        
        company_name = stock.info.get("longName", ticker.upper())
    except:
        company_name = ticker.upper()

    last_quote = history.iloc[-1]
    
    if len(history) > 1:
        prev_close = history.iloc[-2]["Close"]
        change_percent = ((last_quote["Close"] - prev_close) / prev_close) * 100
    else:
        change_percent = 0

    history_data = []
    for date, row in history.iterrows():
        history_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "close": round(row["Close"], 2)
        })
        
    return {
        "ticker": ticker.upper(),
        "name": company_name,  
        "current_price": round(last_quote["Close"], 2),
        "change_percent": round(change_percent, 2),
        "high": round(history["High"].max(), 2),
        "low": round(history["Low"].min(), 2),
        "history": history_data
    }