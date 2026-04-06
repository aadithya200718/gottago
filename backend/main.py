from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import workers, policies, premiums, claims, triggers, admin

app = FastAPI(
    title="GottaGO API",
    description="Parametric income protection for delivery partners",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workers.router, prefix="/api/v1/workers", tags=["workers"])
app.include_router(policies.router, prefix="/api/v1/policies", tags=["policies"])
app.include_router(premiums.router, prefix="/api/v1/premiums", tags=["premiums"])
app.include_router(claims.router, prefix="/api/v1/claims", tags=["claims"])
app.include_router(triggers.router, prefix="/api/v1/triggers", tags=["triggers"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])


@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "gottago-api",
        "health": "/health",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok", "service": "gottago-api"}
