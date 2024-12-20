import React from 'react';
import './App.css'; // Ensure this line is present to apply styles
import FlightDelayPredictor from './FlightDelayPredictor';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { purple, orange } from '@mui/material/colors';

const theme = createTheme({
    palette: {
        primary: {
            main: purple[500], // Purple primary color
        },
        secondary: {
            main: orange[500], // Orange secondary color
        },
    },
    typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif', // Set custom font family
        h4: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 500,
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <title>Flight Delay Predictor</title>
            <div className="App">
                <FlightDelayPredictor />
            </div>
        </ThemeProvider>
    );
}

export default App;
