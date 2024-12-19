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

    const deleteCard = (indexToDelete) => {
        // Remove the card at the specified index
        const updatedCards = cards.filter((_, index) => index !== indexToDelete);
        setCards(updatedCards); // Update state with remaining cards
    };

    return (
        <Box display="flex" alignItems="center" justifyContent="center">
            <Grid2 container spacing={2} justifyContent="center">
                {cards.map((_, originalIndex) => (
                    <Grid2 item xs={12} sm={4} key={originalIndex} style={{ display: 'flex', justifyContent: 'center' }}>
                        <DelayPredictorCardForm 
                            index={originalIndex} // Use original index for naming
                            airports={airports} 
                            airlinesList={airlinesList} 
                            onDelete={deleteCard} // Pass delete function
                        />
                    </Grid2>
                ))}
            </Grid2>
            {cards.length < 3 && (
                <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={addCard} 
                    style={{ marginLeft: '16px', height: 'fit-content' }} // Align button close to last card
                >
                    +
                </Button>
            )}
        </Box>
    );
};

export default InputCards;
