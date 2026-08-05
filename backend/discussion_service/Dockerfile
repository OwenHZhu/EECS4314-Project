FROM python:3.11-slim

# Work from root so shared imports resolve
WORKDIR /app/backend

# Copy requirements.txt
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend folder
COPY . .

# Expose the port 
EXPOSE 8004

# Run the service 
CMD ["python", "-m", "discussion_service.discussion_service"]