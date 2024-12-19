import sys
import os
# Get the parent directory
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
# Add the parent directory to sys.path
sys.path.append(parent_dir)
from app.backend.routes import app


if __name__ == '__main__':
    app.run(debug=True)
