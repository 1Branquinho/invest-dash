import yfinance as yf
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "InvestDash API is running"}

@app.get("/stock/{ticker}")
def get_stock_history(ticker: str):
    stock = yf.Ticker(ticker)
    history = stock.history(period="1mo")
    
    data = []
    for date, row in history.iterrows():
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "close": row["Close"]
        })
        
    return {"ticker": ticker.upper(), "history": data}


#uvicorn main:app --reload