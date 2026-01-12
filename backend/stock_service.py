import yfinance as yf

def fetch_stock_data(ticker: str, period: str):
    stock = yf.Ticker(ticker)

    try:
        history = stock.history(period=period, interval="1d", auto_adjust=False, actions=False)
    except Exception:
        history = None

    if history is None or history.empty:
        return None

    company_name = ticker.upper()
    logo_url = ""

    try:
        fi = stock.fast_info
        if isinstance(fi, dict):
            company_name = fi.get("longName") or fi.get("shortName") or company_name
    except Exception:
        pass

    try:
        info = stock.info
        if isinstance(info, dict):
            company_name = info.get("longName", company_name)
            logo_url = info.get("logo_url", logo_url)
    except Exception:
        pass

    last_quote = history.iloc[-1]

    if len(history) > 1:
        prev_close = history.iloc[-2]["Close"]
        change_percent = ((last_quote["Close"] - prev_close) / prev_close) * 100
    else:
        change_percent = 0

    history_data = [
        {"date": date.strftime("%Y-%m-%d"), "close": round(float(row["Close"]), 2)}
        for date, row in history.iterrows()
    ]

    return {
        "ticker": ticker.upper(),
        "name": company_name,
        "logo": logo_url,
        "current_price": round(float(last_quote["Close"]), 2),
        "change_percent": round(float(change_percent), 2),
        "high": round(float(history["High"].max()), 2),
        "low": round(float(history["Low"].min()), 2),
        "history": history_data,
    }
