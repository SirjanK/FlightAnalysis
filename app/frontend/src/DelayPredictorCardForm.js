// src/DelayPredictorCardForm.js
import React, { useState } from 'react';
import { Card, CardContent, CardActions, IconButton, TextField, Typography, Autocomplete, MenuItem } from '@mui/material';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import EditIcon from '@mui/icons-material/Edit'; // Import Edit icon
import CloseIcon from '@mui/icons-material/Close'; // Import Close icon
import { motion } from 'framer-motion'; // Import motion

const flightColors = {
    0: { title: 'orange', button: '#FFA500' }, // Flight 1 - Orange
    1: { title: 'purple', button: '#800080' }, // Flight 2 - Purple
    2: { title: '#006400', button: '#006400' } // Flight 3 - Dark Green
};

const DelayPredictorCardForm = ({ index, airports, airlinesList, onDelete, onUpdate }) => {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [airline, setAirline] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    const [isLocked, setIsLocked] = useState(false); // State to track if the card is locked

    // Handle form submission (submit button)
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        const flightData = { origin, destination, airline, departureTime };
        
        // Log flight number and fields
        console.log(`Submitting Flight ${index + 1}:`, JSON.stringify(flightData, null, 2));
        
        onUpdate(flightData); // Update parent state with current flight data
        setIsLocked(true); // Lock the card after submission
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} // Animation for exit
            transition={{ duration: 0.3 }} // Duration of the animation
        >
            <Card 
                variant="outlined" 
                className="card" 
                style={{ 
                    width: '300px', 
                    position: 'relative', 
                    backgroundColor: isLocked ? '#f0f0f0' : 'white' // Change background color if locked
                }}
            >
                {/* Conditionally render the close button only for cards 2 and 3 */}
                {index > 0 && (
                    <IconButton 
                        onClick={() => onDelete(index)} // Call delete function
                        style={{ position: 'absolute', top: 8, right: 8 }} // Position the close button
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                )}
                <CardContent>
                    <Typography variant="h6" component="div" align="center" sx={{ color: flightColors[index].title }}>
                        Flight {index + 1}
                    </Typography>
                    <form id={`prediction-form-${index}`} onSubmit={handleSubmit}>
                        <Autocomplete
                            options={airports}
                            value={origin}
                            onChange={(event, newValue) => setOrigin(newValue)}
                            renderInput={(params) => (
                                <TextField {...params} label="Origin" margin="normal" fullWidth size="small" />
                            )}
                        />
                        <Autocomplete
                            options={airports}
                            value={destination}
                            onChange={(event, newValue) => setDestination(newValue)}
                            renderInput={(params) => (
                                <TextField {...params} label="Destination" margin="normal" fullWidth size="small" />
                            )}
                        />
                        <Autocomplete
                            options={airlinesList}
                            value={airline}
                            onChange={(event, newValue) => setAirline(newValue)}
                            renderInput={(params) => (
                                <TextField {...params} label="Airline" margin="normal" fullWidth size="small" />
                            )}
                        />
                        <TextField 
                            fullWidth 
                            label="Departure Time" 
                            value={departureTime} 
                            onChange={(e) => setDepartureTime(e.target.value)} 
                            select 
                            margin="normal"
                            size="small"
                        >
                            <MenuItem value="">
                                <em>Select</em>
                            </MenuItem>
                            <MenuItem value="morning">Morning 06:00-11:59</MenuItem>
                            <MenuItem value="afternoon">Afternoon 12:00-17:59</MenuItem>
                            <MenuItem value="evening">Evening 18:00-23:59</MenuItem>
                            <MenuItem value="night">Night 00:00-05:59</MenuItem>
                        </TextField>
                    </form>
                </CardContent>
                <CardActions style={{ justifyContent: 'flex-end' }}>
                    {isLocked ? (
                        <IconButton 
                            style={{ color: flightColors[index].button }} // Set edit button color to match flight color
                            onClick={() => setIsLocked(false)} // Unlock the card when edit button is clicked
                        >
                            <EditIcon />
                        </IconButton>
                    ) : (
                        <IconButton 
                            style={{ color: flightColors[index].button }} // Set airplane button color to match flight color
                            type="submit" // Use type submit to trigger form submission
                            aria-label={`predict delays for flight ${index + 1}`}
                            onClick={handleSubmit} // Call handleSubmit function
                        >
                            <AirplanemodeActiveIcon />
                        </IconButton>
                    )}
                </CardActions>
            </Card>
        </motion.div>
    );
};

export default DelayPredictorCardForm;

