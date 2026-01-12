from typing import List, Tuple

def period_return_percent(prices: List[float]) -> float:
    if len(prices) < 2 or prices[0] == 0:
        return 0.0
    return ((prices[-1] / prices[0]) - 1.0) * 100.0

def max_drawdown_percent(prices: List[float], dates: List[str]) -> Tuple[float, str, str]:
    if len(prices) < 2:
        d = dates[0] if dates else ""
        return 0.0, d, d

    peak_price = float(prices[0])
    peak_date = dates[0]

    max_dd = 0.0
    mdd_peak_date = dates[0]
    mdd_trough_date = dates[0]

    for price, date in zip(prices[1:], dates[1:]):
        price = float(price)

        if price > peak_price:
            peak_price = price
            peak_date = date
            continue

        dd = (price / peak_price - 1.0) * 100.0 if peak_price != 0 else 0.0

        if dd < max_dd:
            max_dd = dd
            mdd_peak_date = peak_date
            mdd_trough_date = date

    return max_dd, mdd_peak_date, mdd_trough_date
