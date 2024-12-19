from flask import render_template, Flask, request, jsonify, abort
import sys
import os
import pandas as pd
# Get the parent directory
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Add the parent directory to sys.path
sys.path.append(parent_dir)
from flight.delay_calculator import DelayCalculator

app = Flask(__name__)


ASSETS_DIR = "assets/"


def init_delay_calculator() -> DelayCalculator:
    """
    Initialize the delay calculator
    """

    print("Initializing delay calculator...")
    params_df = pd.read_csv(f"{ASSETS_DIR}/model_params.csv")
    return DelayCalculator(params_df=params_df)


delay_calculator = init_delay_calculator()
airline_lookup_df = pd.read_csv(f"{ASSETS_DIR}/airline_id_lookup.csv")
airport_lookup_df = pd.read_csv(f"{ASSETS_DIR}/airport_id_lookup.csv")
# create dictionary from description to code
airline_lookup = airline_lookup_df.set_index('Description')['Code'].to_dict()
airport_lookup = airport_lookup_df.set_index('Description')['Code'].to_dict()


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

    if origin is not None and origin not in airport_lookup_df:
        abort(400, description="Unsupported input: origin")
    if destination is not None and destination not in airport_lookup_df:
        abort(400, description="Unsupported input: destination")
    if airline is not None and airline not in airline_lookup_df:
        abort(400, description="Unsupported input: airline")
    if departure_time is not None and not departure_time in ['morning', 'afternoon', 'evening', 'night']:
        abort(400, description="Unsupported input: departure_time")
    
    # Predict the delays
    delays = delay_calculator.predict_delays(
        orig_airport_id=airport_lookup[origin],
        dest_airport_id=airport_lookup[destination],
        airline_id=airline_lookup[airline],
        departure_time=departure_time,
    )

    if delays is None:
        abort(422, description="Delay calculator cannot support this query")
    
    # Convert numpy array to list for JSON serialization
    delays_list = delays.tolist()
    
    return jsonify({
        'delay_data': delays_list
    })


@app.errorhandler(400)
def bad_request(error):
    return jsonify(error=str(error.description)), 400


@app.errorhandler(422)
def unprocessable_entity(error):
    return jsonify(error=str(error.description)), 422
