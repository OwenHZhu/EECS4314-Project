FROM python:3.11-slim

# Working directory is the root
WORKDIR /app/backend

# Copy global requirements.txt
COPY requirements.txt .

# Install dependencies 
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire backend folder so shared imports work
COPY . .

# Expose the port
EXPOSE 8000

# Run service from root using command specified in init.py
CMD ["python", "-m", "auth_service.auth_service"]