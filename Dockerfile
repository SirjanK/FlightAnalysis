# Stage 1: Build the React frontend
FROM node:18 AS frontend-build

WORKDIR /app/frontend

# Copy package.json and package-lock.json (if available)
COPY app/frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY app/frontend/ ./

# Build the React app
RUN npm run build

# Stage 2: Set up the Flask backend
FROM python:3.11-slim AS backend

WORKDIR /app/backend

# Copy requirements.txt
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY app/backend/ ./

# Copy built frontend files from the previous stage
COPY --from=frontend-build /app/frontend/build ./static

# Copy gunicorn config py
COPY gunicorn_config.py ./

# Expose the port that your Flask app runs on
EXPOSE 8000

# Command to run the Flask app with Gunicorn
CMD ["gunicorn", "-c", "gunicorn_config.py", "app.run:app"]
