from flask import Flask, request, jsonify, abort
from flask_cors import CORS, cross_origin
import pandas as pd
import os
# Get the parent directory
# parent_dir = os.path.dirname(current_dir)
# # Add the parent directory to sys.path
# sys.path.append(parent_dir)
from flight.delay_calculator import DelayCalculator

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

current_dir = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(current_dir, "assets")


def init_delay_calculator() -> DelayCalculator:
    """
    Initialize the delay calculator
    """

    print("Initializing delay calculator...")
    assets_path = os.path.join(ASSETS_DIR, "model_params.csv")
    params_df = pd.read_csv(assets_path)
    return DelayCalculator(params_df=params_df)


delay_calculator = init_delay_calculator()
airline_lookup_df = pd.read_csv(f"{ASSETS_DIR}/airline_id_lookup.csv")
airport_lookup_df = pd.read_csv(f"{ASSETS_DIR}/airport_id_lookup.csv")
# create dictionary from description to code
airline_lookup = airline_lookup_df.set_index('Description')['Code'].to_dict()
airport_lookup = airport_lookup_df.set_index('Description')['Code'].to_dict()


@app.route('/get_options', methods=['GET'])
def get_options():
    return jsonify({
        'airports': list(airport_lookup.keys()),
        'airlines': list(airline_lookup.keys()),
    })


@app.route('/predict', methods=['POST'])
def predict():
    # Get input data from the request
    origin = request.form.get('origin')
    destination = request.form.get('destination')
    airline = request.form.get('airline')
    departure_time = request.form.get('departure-time')

    if origin != "" and origin not in airport_lookup:
        abort(400, description=f"Unsupported input: origin airport: {origin}")
    if destination != "" and destination not in airport_lookup:
        abort(400, description=f"Unsupported input: destination airport: {destination}")
    if airline != "" and airline not in airline_lookup:
        abort(400, description=f"Unsupported input: airline: {airline}")
    if departure_time != "" and not departure_time in ['morning', 'afternoon', 'evening', 'night']:
        abort(400, description=f"Unsupported input: departure_time: {departure_time}")
    
    print(f"Predicting delays for origin: {origin}, destination: {destination}, airline: {airline}, departure_time: {departure_time}")
    # Predict the delays
    delays = delay_calculator.predict_delays(
        orig_airport_id=airport_lookup.get(origin),
        dest_airport_id=airport_lookup.get(destination),
        airline_id=airline_lookup.get(airline),
        time_bucket=departure_time if departure_time != "" else None,
    )

    if delays is None:
        abort(422, description="We cannot support this query given low data support")
    
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
