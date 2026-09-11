# FasalSetu Backend Dockerfile
# Python 3.11 slim base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Install system build dependencies for psycopg2 and ML packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install pinned Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code and dataset
COPY . .

# MODEL BUILD STRATEGY:
# Execute model training at Docker build time so crop_rf_model.joblib is baked into the image.
# Does NOT re-train at container startup; container startup loads this pre-baked artifact.
RUN python -m app.ml.train_crop_model

# Expose FastAPI default port
EXPOSE 8000

# Run FastAPI via uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
