import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import InputCards from './InputCards';
import Results from './Results';

const FlightDelayPredictor = () => {
    const [airports, setAirports] = useState([]);
    const [airlinesList, setAirlinesList] = useState([]);
    const [predictionResults, setPredictionResults] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/get_options')  // TODO generalize for prod
            .then(response => response.json())
            .then(data => {
                setAirports(data.airports);
                setAirlinesList(data.airlines);
            })
            .catch(error => console.error('Error fetching options:', error));
    }, []);

    const handlePrediction = (flightData) => {
        fetch('http://localhost:8000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(flightData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            setPredictionResults(data.delay_data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom sx={{ color: 'primary.main' }}>
                Flight Delay Predictor
            </Typography>
            <InputCards 
                airports={airports} 
                airlinesList={airlinesList} 
                onPrediction={handlePrediction}
            />
            {predictionResults && <Results delayData={predictionResults} />}
        </Container>
    );
};

export default FlightDelayPredictor;
