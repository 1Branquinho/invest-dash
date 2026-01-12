from typing import List, Tuple

def period_return_percent(prices: List[float]) -> float:
    if len(prices) < 2 or prices[0] == 0:
        return 0.0
    return ((prices[-1] / prices[0]) - 1.0) * 100.0

def max_drawdown_percent(prices: List[float], dates: List[str]) -> Tuple[float, str, str]:
    peak = prices[0]
    peak_date = dates[0]
    max_dd = 0.0
    trough_date = dates[0]

    for price, date in zip(prices, dates):
        if price > peak:
            peak = price
            peak_date = date
        dd = (price / peak - 1.0) * 100 if peak != 0 else 0
        if dd < max_dd:
            max_dd = dd
            trough_date = date

    return max_dd, peak_date, trough_date
