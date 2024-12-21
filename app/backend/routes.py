from flask import Flask, request, jsonify, abort, send_from_directory
from flask_cors import CORS, cross_origin
import pandas as pd
import os
from typing import Optional
# Get the parent directory
# parent_dir = os.path.dirname(current_dir)
# # Add the parent directory to sys.path
# sys.path.append(parent_dir)
from flight.delay_calculator import DelayCalculator

current_dir = os.path.dirname(os.path.abspath(__file__))
frontend_dir = os.path.join(os.path.dirname(current_dir), "frontend/build")
app = Flask(__name__, static_folder=frontend_dir, static_url_path='')

# Determine the environment
ENVIRONMENT = os.getenv('FLASK_ENV', 'development')  # Default to development if not set
app.logger.info(f"Running in {ENVIRONMENT} environment")

if ENVIRONMENT == 'production':
    # Allow both HTTP and HTTPS for production
    CORS(app, resources={r"/*": {"origins": ["https://flightdelay.us"]}})
else:
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:8000"]}})

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


@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/get_options', methods=['GET'])
def get_options():
    return jsonify({
        'airports': list(airport_lookup.keys()),
        'airlines': list(airline_lookup.keys()),
    })


def validate_request() -> Optional[str]:
    """
    Validate the request data

    :return: Error message if validation fails, None otherwise (indicating success)
    """

    # Get input data from the request
    request_data = request.get_json()
    origin = request_data.get('origin')
    destination = request_data.get('destination')
    airline = request_data.get('airline')
    departure_time = request_data.get('departureTime')

    if origin and origin not in airport_lookup:
        return f"Unsupported input: origin airport: {origin}"
    if destination and destination not in airport_lookup:
        return f"Unsupported input: destination airport: {destination}"
    if airline and airline not in airline_lookup:
        return f"Unsupported input: airline: {airline}"
    if departure_time and not departure_time in ['morning', 'afternoon', 'evening', 'night']:
        return f"Unsupported input: departure_time: {departure_time}"
    
    if not delay_calculator.validate(origin, destination, airline, departure_time):
        return "We cannot support this query given low data support"
    
    return None


@app.route('/validate', methods=['GET'])
def validate():
    validation_result = validate_request()

    if validation_result is None:
        return jsonify({
            'success': True,
            'message': ''
        })
    else:
        return jsonify({
            'success': False,
            'message': validation_result
        })


@app.route('/predict', methods=['POST'])
def predict():
    # Get input data from the request
    request_data = request.get_json()
    origin = request_data.get('origin')
    destination = request_data.get('destination')
    airline = request_data.get('airline')
    departure_time = request_data.get('departureTime')

    validation_result = validate_request()
    if validation_result is not None:
        abort(400, description=validation_result)
    
    app.logger.debug(f"Predicting delays for origin: {origin}, destination: {destination}, airline: {airline}, departure_time: {departure_time}")
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
