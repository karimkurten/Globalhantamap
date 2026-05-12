# Production Dockerfile for Railway / any Docker host.
# This file makes Railway use Docker (deterministic) instead of Railpack/Nixpacks
# auto-detection — which avoids the "secret admin not found" build error.

FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# System deps (curl for healthcheck, gcc for any C extensions in requirements)
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first (layer cache)
COPY requirements.txt ./
RUN pip install --upgrade pip && \
    pip install -r requirements.txt --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

# Copy backend source
COPY . .

# Railway provides $PORT at runtime; fall back to 8001 locally
ENV PORT=8001
EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS "http://localhost:${PORT}/api/health" || exit 1

# Use shell form so $PORT is expanded by /bin/sh
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
