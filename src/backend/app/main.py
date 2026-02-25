from fastapi import FastAPI

from app.api.routes import auth, users, tickets

from app.db.base import Base

from app.db.session import engine

app = FastAPI(title="MaksosTeam Project API")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tickets.router)

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/")
async def root():
    return {"message": "API is running"}
