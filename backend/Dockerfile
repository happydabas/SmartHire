FROM python:3.11-slim

WORKDIR /app

# Prevent Python from writing .pyc files and enable unbuffered output logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies needed for compiling standard packages (e.g. gcc, psycopg2 dependencies)
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install python package requirements
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy backend application source files
COPY . .

# Expose FastAPI server standard port
EXPOSE 8000

# Execute server initialization script or run server directly
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
