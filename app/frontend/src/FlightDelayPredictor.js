// src/FlightDelayPredictor.js
import React, { useEffect, useState } from 'react';

const FlightDelayPredictor = () => {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [airline, setAirline] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    const [airports, setAirports] = useState([]);
    const [airlinesList, setAirlinesList] = useState([]);

    // Fetch options from server (mocked here for simplicity)
    useEffect(() => {
        // Mocking the fetch call; replace this with your actual fetch call
        const fetchOptions = async () => {
            const data = {
                airports: ['JFK', 'LAX', 'ORD', 'DFW'], // Example airports
                airlines: ['Delta', 'American Airlines', 'United'] // Example airlines
            };
            setAirports(data.airports);
            setAirlinesList(data.airlines);
        };

        fetchOptions();
    }, []);

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', { origin, destination, airline, departureTime });
        // Here you would typically call your backend API
    };

    return (
        <div className="container">
            <h1>Flight Delay Predictor</h1>
            <form id="prediction-form" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="origin">Origin Airport</label>
                    <input 
                        type="text" 
                        id="origin" 
                        name="origin" 
                        value={origin} 
                        onChange={(e) => setOrigin(e.target.value)} 
                        list="airport-list"
                    />
                    <datalist id="airport-list">
                        {airports.map((airport) => (
                            <option key={airport} value={airport} />
                        ))}
                    </datalist>
                </div>
                <div className="input-group">
                    <label htmlFor="destination">Destination Airport</label>
                    <input 
                        type="text" 
                        id="destination" 
                        name="destination" 
                        value={destination} 
                        onChange={(e) => setDestination(e.target.value)} 
                        list="airport-list"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="airline">Airline</label>
                    <input 
                        type="text" 
                        id="airline" 
                        name="airline" 
                        value={airline} 
                        onChange={(e) => setAirline(e.target.value)} 
                        list="airline-list"
                    />
                    <datalist id="airline-list">
                        {airlinesList.map((airline) => (
                            <option key={airline} value={airline} />
                        ))}
                    </datalist>
                </div>
                <div className="input-group">
                    <label htmlFor="departure-time">Departure Time</label>
                    <select 
                        id="departure-time" 
                        name="departure-time" 
                        value={departureTime} 
                        onChange={(e) => setDepartureTime(e.target.value)}
                    >
                        <option value="">Select a time range</option>
                        <option value="morning">Morning 06:00-11:59</option>
                        <option value="afternoon">Afternoon 12:00-17:59</option>
                        <option value="evening">Evening 18:00-23:59</option>
                        <option value="night">Night 00:00-05:59</option>
                    </select>
                </div>
                <button type="submit">Predict Delays</button>
            </form>
        </div>
    );
};

export default FlightDelayPredictor;
