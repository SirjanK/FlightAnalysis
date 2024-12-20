import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import InputCards from './InputCards';
import Results from './Results';

const FlightDelayPredictor = () => {
    const [airports, setAirports] = useState([]);
    const [airlinesList, setAirlinesList] = useState([]);
    const [predictionResults, setPredictionResults] = useState([]);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/get_options`)
            .then(response => response.json())
            .then(data => {
                setAirports(data.airports);
                setAirlinesList(data.airlines);
            })
            .catch(error => console.error('Error fetching options:', error));
    }, []);

    const handlePrediction = (flightDataArray) => {
        const predictions = flightDataArray.map(flightData => 
            fetch(`${process.env.REACT_APP_API_URL}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(flightData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(errorData.error);
                    })
                }
                return response.json();
            })
        );
    
        Promise.all(predictions)
            .then(results => {
                setPredictionResults(results.map(result => result.delay_data));
            })
            .catch(error => {
                console.error('Error:', error);
                showErrorDialog(error.message || "We couldn't process your request. Please try again.");
            });
    };
    
    const showErrorDialog = (message) => {
        alert(message);
    };

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom sx={{ color: 'primary.main' }}>
                Flight Delay Predictor USA
            </Typography>
            <InputCards 
                airports={airports} 
                airlinesList={airlinesList} 
                onPrediction={handlePrediction}
            />
            {predictionResults && predictionResults.length > 0 && <Results delayData={predictionResults} />}
        </Container>
    );
};

export default FlightDelayPredictor;
