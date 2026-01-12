from pydantic import BaseModel
from typing import List, Literal

Period = Literal["5d", "1mo", "6mo", "1y", "5y", "max"]

class StockHistoryPoint(BaseModel):
    date: str
    close: float

class StockResponse(BaseModel):
    ticker: str
    name: str
    logo: str
    current_price: float
    change_percent: float
    high: float
    low: float
    period: Period
    period_start_date: str
    period_end_date: str
    period_start_price: float
    period_end_price: float
    period_return_percent: float
    max_drawdown_percent: float
    max_drawdown_peak_date: str
    max_drawdown_trough_date: str
    history: List[StockHistoryPoint]
