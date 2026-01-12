from app.domain.metrics import period_return_percent, max_drawdown_percent

def test_period_return_positive():
    prices = [100, 110, 120]
    result = period_return_percent(prices)
    assert round(result, 2) == 20.0

def test_period_return_negative():
    prices = [100, 90, 80]
    result = period_return_percent(prices)
    assert round(result, 2) == -20.0

def test_period_return_single_point():
    prices = [100]
    result = period_return_percent(prices)
    assert result == 0.0

def test_max_drawdown_basic():
    prices = [100, 120, 90, 110]
    dates = ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04"]
    mdd, peak, trough = max_drawdown_percent(prices, dates)
    assert round(mdd, 2) == -25.0
    assert peak == "2024-01-02"
    assert trough == "2024-01-03"

def test_max_drawdown_no_drawdown():
    prices = [100, 110, 120]
    dates = ["2024-01-01", "2024-01-02", "2024-01-03"]
    mdd, peak, trough = max_drawdown_percent(prices, dates)
    assert mdd == 0.0
    assert peak == "2024-01-01"
    assert trough == "2024-01-01"
