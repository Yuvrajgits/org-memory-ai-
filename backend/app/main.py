print("🔥🔥🔥 THIS IS THE REAL APP.MAIN 🔥🔥🔥")
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.documents import router as documents_router

from app.api.health import router as health_router
from app.api.ingest import router as ingest_router
from app.api.ask import router as ask_router
from app.core.config import APP_NAME, ALLOWED_ORIGINS, ENV
from app.core.logging import setup_logging

# Initialize logging
setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title=APP_NAME,
    version="0.1.0",
)

# Global exception handler for production-ready error responses
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch all unhandled exceptions and return structured JSON"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "error": str(exc) if ENV == "development" else "An unexpected error occurred"
        }
    )

# 🔑 CORS configuration based on environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # ✅ Production-ready: environment-based origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(ingest_router)
app.include_router(ask_router)
app.include_router(documents_router)

@app.get("/")
def root():
    return {"message": f"{APP_NAME} backend is running"}
