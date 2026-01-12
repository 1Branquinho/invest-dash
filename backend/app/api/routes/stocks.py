from fastapi import APIRouter
from fastapi.responses import JSONResponse
from app.core.cache import TTLCache
from app.core.errors import ValidationError, NotFoundError, UpstreamError
from app.services.yahoo_finance import fetch_history
from app.domain.metrics import period_return_percent, max_drawdown_percent
from app.schemas.stock import StockResponse, Period

router = APIRouter(prefix="/stock", tags=["stock"])

ALLOWED_PERIODS = {"5d", "1mo", "6mo", "1y", "5y", "max"}

def sanitize_ticker(ticker: str) -> str:
    return ticker.strip().upper()

def error_response(e):
    return JSONResponse(
        status_code=e.http_status,
        content={"error": {"code": e.code, "message": e.message}},
    )

def is_probably_invalid_ticker(stock) -> bool:
    try:
        fi = stock.fast_info
        if isinstance(fi, dict) and len(fi) > 0:
            return False
    except Exception:
        pass

    try:
        info = stock.info
        if isinstance(info, dict) and len(info) > 0:
            return False
    except Exception:
        pass

    return True

def get_identity(stock, fallback: str):
    name = fallback
    logo = ""

    try:
        fi = stock.fast_info
        if isinstance(fi, dict):
            name = fi.get("longName") or fi.get("shortName") or name
    except Exception:
        pass

    try:
        info = stock.info
        if isinstance(info, dict):
            name = info.get("longName", name)
            logo = info.get("logo_url", logo)
    except Exception:
        pass

    return name, logo

def create_stock_router(cache: TTLCache) -> APIRouter:
    @router.get("/{ticker}", response_model=StockResponse)
    def get_stock(ticker: str, period: Period = "1mo"):
        t = sanitize_ticker(ticker)
        p = str(period)

        if not t:
            return error_response(ValidationError("INVALID_TICKER", "Invalid ticker", 400))

        if p not in ALLOWED_PERIODS:
            return error_response(ValidationError("INVALID_PERIOD", "Invalid period", 400))

        cache_key = f"{t}:{p}"
        cached = cache.get(cache_key)
        if cached is not None:
            if isinstance(cached, dict) and cached.get("error"):
                return JSONResponse(status_code=cached["status"], content=cached["error"])
            return cached

        try:
            stock, history = fetch_history(t, p)
        except Exception:
            payload = {"error": {"code": "UPSTREAM_ERROR", "message": "Upstream provider failed"}}
            cache.set(cache_key, {"status": 503, "error": payload}, ttl_seconds=15)
            return JSONResponse(status_code=503, content=payload)

        if history is None or history.empty:
            if is_probably_invalid_ticker(stock):
                payload = {"error": {"code": "NOT_FOUND", "message": "Ticker not found"}}
                cache.set(cache_key, {"status": 404, "error": payload}, ttl_seconds=30)
                return JSONResponse(status_code=404, content=payload)

            payload = {"error": {"code": "UPSTREAM_NO_DATA", "message": "No data returned by upstream provider"}}
            cache.set(cache_key, {"status": 503, "error": payload}, ttl_seconds=15)
            return JSONResponse(status_code=503, content=payload)

        closes = history["Close"].astype(float).tolist()
        dates = [d.strftime("%Y-%m-%d") for d in history.index]

        pr = period_return_percent(closes)
        mdd, peak, trough = max_drawdown_percent(closes, dates)

        first_close = float(closes[0])
        last_close = float(closes[-1])

        last_quote = history.iloc[-1]
        if len(history) > 1:
            prev_close = float(history.iloc[-2]["Close"])
        else:
            prev_close = float(last_quote["Close"])

        daily_change = ((float(last_quote["Close"]) - prev_close) / prev_close) * 100.0 if prev_close != 0 else 0.0

        name, logo = get_identity(stock, t)

        payload = StockResponse(
            ticker=t,
            name=name,
            logo=logo,
            current_price=round(float(last_quote["Close"]), 2),
            change_percent=round(float(daily_change), 2),
            high=round(float(history["High"].max()), 2),
            low=round(float(history["Low"].min()), 2),
            period=p,
            period_start_date=dates[0],
            period_end_date=dates[-1],
            period_start_price=round(first_close, 2),
            period_end_price=round(last_close, 2),
            period_return_percent=round(float(pr), 2),
            max_drawdown_percent=round(float(mdd), 2),
            max_drawdown_peak_date=peak,
            max_drawdown_trough_date=trough,
            history=[{"date": dates[i], "close": round(float(closes[i]), 2)} for i in range(len(closes))],
        )

        cache.set(cache_key, payload)
        return payload

    return router
