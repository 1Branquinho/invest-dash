from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from stock_service import fetch_stock_data

app = FastAPI(
    title="InvestDash API",
    version="1.0.0"
)

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/stock/{ticker}")
def get_stock_details(ticker: str, period: str = "1mo"):
    try:
        data = fetch_stock_data(ticker, period)
        
        if data is None:
            raise HTTPException(status_code=404, detail="Ticker not found")
            
        return data

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

#uvicorn main:app --reload
#.\.venv\Scripts\activate