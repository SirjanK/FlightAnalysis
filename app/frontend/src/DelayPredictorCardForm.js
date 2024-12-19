// src/DelayPredictorCardForm.js
import React, { useState } from 'react';
import { Card, CardContent, CardActions, IconButton, TextField, Typography, Autocomplete, MenuItem } from '@mui/material';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import CloseIcon from '@mui/icons-material/Close'; // Import Close icon

const DelayPredictorCardForm = ({ index, airports, airlinesList, onDelete }) => {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [airline, setAirline] = useState('');
    const [departureTime, setDepartureTime] = useState('');

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(`Flight ${index + 1} submitted:`, { origin, destination, airline, departureTime });
    };

    return (
        <Card variant="outlined" className="card" style={{ width: '300px', position: 'relative' }}>
            {/* Conditionally render the close button only for cards 2 and 3 */}
            {index > 0 && (
                <IconButton 
                    onClick={() => onDelete(index)} 
                    style={{ position: 'absolute', top: 8, right: 8 }} // Position the close button
                    size="small"
                >
                    <CloseIcon />
                </IconButton>
            )}
            <CardContent>
                <Typography variant="h6" component="div" align="center" sx={{ color: 'secondary.main' }}>
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
                <IconButton 
                    color="primary" 
                    onClick={handleSubmit} 
                    aria-label={`predict delays for flight ${index + 1}`}
                >
                    <AirplanemodeActiveIcon />
                </IconButton>
            </CardActions>
        </Card>
    );
};

export default DelayPredictorCardForm;
