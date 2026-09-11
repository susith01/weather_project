# ============================================================
# Dockerfile
# WeatherGuard - Containerized Deployment
# Smart India Hackathon 2026 | Problem Statement: SIH26073
# ============================================================

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production Python Backend + Static Hosting
FROM python:3.11-slim
WORKDIR /app

# Install system libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code & frontend static build
COPY . .
COPY --from=frontend-builder /app/dist ./static

EXPOSE 8000

ENV PYTHONUNBUFFERED=1

CMD ["uvicorn", "fastapi_app:app", "--host", "0.0.0.0", "--port", "8000"]
