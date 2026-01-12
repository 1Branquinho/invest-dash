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

def create_stock_router(cache: TTLCache) -> APIRouter:
    @router.get("/{ticker}", response_model=StockResponse)
    def get_stock(ticker: str, period: Period = "1mo"):
        try:
            t = sanitize_ticker(ticker)
            p = str(period)

            if not t:
                raise ValidationError("INVALID_TICKER", "Invalid ticker", 400)

            if p not in ALLOWED_PERIODS:
                raise ValidationError("INVALID_PERIOD", "Invalid period", 400)

            key = f"{t}:{p}"
            cached = cache.get(key)
            if cached:
                return cached

            try:
                stock, history = fetch_history(t, p)
            except Exception:
                raise UpstreamError("UPSTREAM_ERROR", "Failed to fetch data", 503)

            if history is None or history.empty:
                raise NotFoundError("NOT_FOUND", "Ticker not found", 404)

            closes = history["Close"].astype(float).tolist()
            dates = [d.strftime("%Y-%m-%d") for d in history.index]

            pr = period_return_percent(closes)
            mdd, peak, trough = max_drawdown_percent(closes, dates)

            first_close = closes[0]
            last_close = closes[-1]

            last_quote = history.iloc[-1]
            prev_close = history.iloc[-2]["Close"] if len(history) > 1 else last_quote["Close"]
            daily_change = ((last_quote["Close"] - prev_close) / prev_close) * 100 if prev_close != 0 else 0

            name = t
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
                    logo = info.get("logo_url", "")
            except Exception:
                pass

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
                period_return_percent=round(pr, 2),
                max_drawdown_percent=round(mdd, 2),
                max_drawdown_peak_date=peak,
                max_drawdown_trough_date=trough,
                history=[
                    {"date": dates[i], "close": round(closes[i], 2)}
                    for i in range(len(closes))
                ],
            )

            cache.set(key, payload)
            return payload

        except (ValidationError, NotFoundError, UpstreamError) as e:
            return error_response(e)

    return router
