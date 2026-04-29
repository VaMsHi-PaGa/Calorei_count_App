import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.db.database import Base, engine
from app.models import FoodLog, User, WeightLog, UserGoal
from app.routes import auth, dashboard, food_log, users, weight_log, goals, reports


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan)

_cors_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]
_extra = os.getenv("EXTRA_CORS_ORIGIN")
if _extra:
    _cors_origins.append(_extra)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(food_log.router)
app.include_router(weight_log.router)
app.include_router(dashboard.router)
app.include_router(goals.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {"message": "Fitness App API running"}
