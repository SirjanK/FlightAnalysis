// src/InputCards.js
import React, { useState } from 'react';
import DelayPredictorCardForm from './DelayPredictorCardForm';
import { Grid2, Button, Box } from '@mui/material';

const InputCards = ({ airports, airlinesList }) => {
    const [cards, setCards] = useState([0]); // Start with one card

    const addCard = () => {
        if (cards.length < 3) {
            setCards([...cards, cards.length]); // Add a new card index
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center">
            <Grid2 container spacing={2} justifyContent="center">
                {cards.map((index) => (
                    <Grid2 item xs={12} sm={4} key={index}>
                        <DelayPredictorCardForm index={index} airports={airports} airlinesList={airlinesList} />
                    </Grid2>
                ))}
            </Grid2>
            {cards.length < 3 && (
                <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={addCard} 
                    style={{ marginLeft: '16px', height: 'fit-content' }} // Add margin and fit height
                >
                    +
                </Button>
            )}
        </Box>
    );
};

export default InputCards;
