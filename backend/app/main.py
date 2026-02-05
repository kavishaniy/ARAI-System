from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api import auth, analysis
import re

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configure CORS - Updated for production deployment
# Explicitly list all allowed origins
cors_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://arai-system.vercel.app",
    "https://arai-system-git-main-kavishaniy.vercel.app",
    "https://arai-system-kavishaniy.vercel.app",
]

# Add any additional origins from environment variable
if settings.ALLOWED_ORIGINS:
    env_origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")]
    cors_origins.extend(env_origins)

print(f"🔧 CORS Configuration:")
print(f"   ALLOWED_ORIGINS env var: {settings.ALLOWED_ORIGINS}")
print(f"   Configured origins: {cors_origins}")
print(f"   Environment: {settings.ENVIRONMENT}")

# Custom CORS middleware to handle Vercel preview URLs dynamically
@app.middleware("http")
async def dynamic_cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin")
    
    # Check if origin is allowed
    allowed = False
    if origin:
        # Allow if in explicit list
        if origin in cors_origins:
            allowed = True
        # Allow Vercel preview URLs (pattern: https://*-kavishaniy.vercel.app)
        elif re.match(r"https://.*\.vercel\.app$", origin):
            allowed = True
            print(f"✅ Allowing Vercel preview URL: {origin}")
    
    response = await call_next(request)
    
    # Add CORS headers if allowed
    if allowed and origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Expose-Headers"] = "*"
        response.headers["Access-Control-Max-Age"] = "3600"
    
    return response

# Handle preflight OPTIONS requests
@app.options("/{full_path:path}")
async def preflight_handler(request: Request, full_path: str):
    origin = request.headers.get("origin")
    
    # Check if origin is allowed
    allowed = False
    if origin:
        if origin in cors_origins or re.match(r"https://.*\.vercel\.app$", origin):
            allowed = True
    
    if allowed:
        return JSONResponse(
            content={},
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Max-Age": "3600",
            }
        )
    
    return JSONResponse(content={"detail": "Origin not allowed"}, status_code=403)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)


# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "ARAI API is running",
        "version": settings.VERSION,
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/debug/cors")
async def debug_cors():
    """Debug endpoint to check CORS configuration"""
    return {
        "allowed_origins_env": settings.ALLOWED_ORIGINS,
        "backend_cors_origins": settings.BACKEND_CORS_ORIGINS
    }


# Include routers
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["authentication"]
)

app.include_router(
    analysis.router,
    prefix=f"{settings.API_V1_STR}/analysis",
    tags=["analysis"]
)


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error", "detail": str(exc)}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )