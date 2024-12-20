// src/InputCards.js
import React, { useState } from 'react';
import DelayPredictorCardForm from './DelayPredictorCardForm';
import { Grid2, Button, Box } from '@mui/material';

const InputCards = ({ airports, airlinesList, onPrediction }) => {
    const [cards, setCards] = useState([0]); // Start with one card
    const [cardData, setCardData] = useState([{ origin: '', destination: '', airline: '', departureTime: '' }]); // Store card data

    const addCard = () => {
        if (cards.length < 3) {
            setCards([...cards, cards.length]); // Add a new card index
            setCardData([...cardData, { origin: '', destination: '', airline: '', departureTime: '' }]); // Add empty data for new card
        }
    };

    const deleteCard = (indexToDelete) => {
        const updatedCards = cards.filter((_, index) => index !== indexToDelete);
        const updatedCardData = cardData.filter((_, index) => index !== indexToDelete);
        setCards(updatedCards); // Update state with remaining cards
        setCardData(updatedCardData); // Update card data
        onPrediction(updatedCardData)  // re-render charts
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
                            onUpdate={(data) => {
                                const updatedData = [...cardData];
                                updatedData[originalIndex] = data; // Update specific card data
                                setCardData(updatedData); // Set updated card data
                                onPrediction(updatedData);
                            }} 
                        />
                    </Grid2>
                ))}
            </Grid2>
            {cards.length < 3 && (
                <Button 
                    variant="contained" 
                    style={{ backgroundColor: '#800080', color: 'white', marginLeft: '16px', height: 'fit-content' }} // Set "+" button color to purple with white text
                    onClick={addCard} // Call addCard which logs entries
                >
                    +
                </Button>
            )}
        </Box>
    );
};

export default InputCards;

