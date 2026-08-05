FROM python:3.11-slim

# Work from backend root so shared imports resolve
WORKDIR /app/backend

# Copy requirements.txt
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire backend 
COPY . .

# Run the consumer
CMD ["python", "-m", "analytics_service.consumer"]
