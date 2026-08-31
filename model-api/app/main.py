"""FastAPI application entry point."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .model import model_manager
from .routers import estimates, model


@asynccontextmanager
async def lifespan(app: FastAPI):
    model_manager.load()
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description=(
        "Housing price prediction model plus an estimate-history API. "
        "Interactive docs at `/docs`."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(model.router)
app.include_router(estimates.router, prefix="/estimates")


@app.get("/", tags=["meta"])
def root() -> dict:
    return {"message": settings.app_name, "docs": "/docs", "health": "/health"}
