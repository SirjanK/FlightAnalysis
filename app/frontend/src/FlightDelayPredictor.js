// src/FlightDelayPredictor.js
import React, { useState } from 'react';
import { Container, Typography } from '@mui/material';
import InputCards from './InputCards'; // Import the InputCards component

const FlightDelayPredictor = () => {
    // Mock data for airports and airlines
    const [airports] = useState(['JFK', 'LAX', 'ORD', 'DFW']);
    const [airlinesList] = useState(['Delta', 'American Airlines', 'United']);

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom sx={{ color: 'primary.main' }}>
                Flight Delay Predictor
            </Typography>
            <InputCards airports={airports} airlinesList={airlinesList} />
        </Container>
    );
};

export default FlightDelayPredictor;
