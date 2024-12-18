from flask import render_template, Flask, request, jsonify
import sys
import os
# Get the parent directory
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Add the parent directory to sys.path
sys.path.append(parent_dir)
from flight.delay_calculator import DelayCalculator

app = Flask(__name__)
delay_calculator = DelayCalculator()

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    # Get input data from the request
    origin = request.form.get('origin')
    destination = request.form.get('destination')
    airline = request.form.get('airline')
    departure_time = request.form.get('departure_time')
    
    # Predict the delays
    # TODO implement name to ID mapping
    delays = delay_calculator.predict_delays(None, None, None, None)
    
    # Convert numpy array to list for JSON serialization
    delays_list = delays.tolist()
    
    return jsonify({
        'delay_data': delays_list
    })
