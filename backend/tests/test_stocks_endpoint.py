from fastapi.testclient import TestClient
from app.main import app

def mock_fetch_history_ok(ticker, period):
    class MockStock:
        fast_info = {"longName": "Mock Company"}
        info = {"logo_url": "http://logo.test/logo.png"}

    import pandas as pd

    dates = pd.to_datetime([
        "2024-01-01",
        "2024-01-02",
        "2024-01-03",
        "2024-01-04",
    ])

    data = {
        "Close": [100.0, 120.0, 90.0, 110.0],
        "High": [101.0, 121.0, 91.0, 111.0],
        "Low": [99.0, 119.0, 89.0, 109.0],
    }

    history = pd.DataFrame(data, index=dates)
    return MockStock(), history

def mock_fetch_history_empty(ticker, period):
    import pandas as pd
    return None, pd.DataFrame()

def test_get_stock_success(monkeypatch):
    monkeypatch.setattr("app.api.routes.stocks.fetch_history", mock_fetch_history_ok)

    client = TestClient(app)
    response = client.get("/stock/AAPL?period=1mo")

    assert response.status_code == 200

    payload = response.json()

    assert payload["ticker"] == "AAPL"
    assert payload["period"] == "1mo"
    assert payload["current_price"] == 110.0
    assert payload["period_return_percent"] == 10.0
    assert payload["max_drawdown_percent"] == -25.0
    assert payload["max_drawdown_peak_date"] == "2024-01-02"
    assert payload["max_drawdown_trough_date"] == "2024-01-03"
    assert len(payload["history"]) == 4

def test_get_stock_not_found(monkeypatch):
    monkeypatch.setattr("app.api.routes.stocks.fetch_history", mock_fetch_history_empty)

    client = TestClient(app)
    response = client.get("/stock/INVALID?period=1mo")

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "NOT_FOUND"

def test_get_stock_invalid_period():
    client = TestClient(app)
    response = client.get("/stock/AAPL?period=invalid")
    assert response.status_code == 422
