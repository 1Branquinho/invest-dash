from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.cache import TTLCache
from app.api.routes.stocks import create_stock_router

settings = get_settings()
cache = TTLCache(settings.cache_ttl_seconds)

app = FastAPI(title=settings.app_name, version=settings.app_version)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(create_stock_router(cache))

@app.get("/health")
def health():
    return {"status": "ok"}


#uvicorn main:app --reload
#.\.venv\Scripts\activate