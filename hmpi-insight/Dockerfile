# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Create necessary directories
RUN mkdir -p /app/logs
RUN mkdir -p /app/data
RUN mkdir -p /app/models
RUN mkdir -p /app/chroma_db

# Copy application code
COPY omni_agent/ /app/omni_agent/
COPY config/ /app/config/
COPY scripts/ /app/scripts/

# Create non-root user for security
RUN groupadd -r omniagent && useradd -r -g omniagent omniagent
RUN chown -R omniagent:omniagent /app
USER omniagent

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/system/health || exit 1

# Run the application
CMD ["uvicorn", "omni_agent.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
