# Stage 1: Build the React frontend
FROM node:18 AS frontend-build

# Set the working directory for the React frontend
WORKDIR /app/frontend

# Copy package.json and package-lock.json
COPY app/frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the rest of the React code
COPY app/frontend/ ./

# Build the React app
RUN npm run build

# Stage 2: Set up the Flask backend
FROM python:3.11-slim AS backend

# Set the working directory for the Flask backend
WORKDIR /app

# Copy requirements.txt and install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code, including run.py and backend folder
COPY app/run.py ./app/run.py
COPY app/backend ./app/backend

# Copy additional Python libraries from flight/
COPY flight ./flight

# Copy assets (e.g., model_params.csv, airline_id_lookup.csv)
COPY app/backend/assets ./app/backend/assets

# Copy built React frontend files from Stage 1 into Flask's static folder
COPY --from=frontend-build /app/frontend/build ./app/frontend/build

# Copy gunicorn configuration file
COPY gunicorn_config.py ./gunicorn_config.py

# Expose Flask's default port (8000)
EXPOSE 8000

# Command to run Flask with Gunicorn
CMD ["gunicorn", "-c", "gunicorn_config.py", "app.run:app"]
