#!/bin/bash

# Function to clean up background processes
cleanup() {
    echo "Terminating processes..."
    kill $FLASK_PID
    exit 0
}

# Trap SIGINT (Ctrl+C) and call cleanup function
trap cleanup SIGINT

# Navigate to the frontend directory and start the React app
echo "Starting React frontend..."
cd app/frontend || exit
npm start &

# Get the PID of the last background process (React app)
REACT_PID=$!

# Navigate to the backend directory and start the Flask app
echo "Starting Flask backend..."
cd ../ || exit
python run.py &

# Get the PID of the last background process (Flask app)
FLASK_PID=$!

# Wait for both processes to finish
wait $REACT_PID
wait $FLASK_PID
