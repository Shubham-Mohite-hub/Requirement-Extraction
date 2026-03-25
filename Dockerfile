# Use a stable Python version that has pre-built wheels for spaCy
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Install system dependencies needed for some Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy your requirements first (better for caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your code
COPY . .

# Run the API
CMD ["uvicorn", "main_api:app", "--host", "0.0.0.0", "--port", "8000"]