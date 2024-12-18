document.addEventListener('DOMContentLoaded', function() {
    const predictButton = document.getElementById('predict-button');
    const resultsDiv = document.getElementById('results');
    const delayPercentages = document.getElementById('delay-percentages');
    const delayChart = document.getElementById('delay-chart');
    let chart; // Variable to store the chart instance

    function predictDelays() {
        const formData = new FormData(document.getElementById('prediction-form'));

        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            updateResults(data.delay_data);
        })
        .catch(error => console.error('Error:', error));
    }

    function updateResults(delayData) {
        // Update table
        const thirtyMinProb = delayData.find(d => d[0] >= 30)?.[1] || 0;
        const oneHourProb = delayData.find(d => d[0] >= 60)?.[1] || 0;
        const twoHourProb = delayData.find(d => d[0] >= 120)?.[1] || 0;
    
        delayPercentages.innerHTML = `
            <td>${(thirtyMinProb * 100).toFixed(2)}%</td>
            <td>${(oneHourProb * 100).toFixed(2)}%</td>
            <td>${(twoHourProb * 100).toFixed(2)}%</td>
        `;
    
        // Show results
        resultsDiv.style.display = 'block';
    
        // Update or create chart
        if (chart) {
            chart.destroy();
        }

        // Prepare y-values corresponding to all x-values in delayData
        const dataPoints = delayData.map(d => d[1] * 100); // Keep all y-values
    
        // Create the chart
        chart = new Chart(delayChart, {
            type: 'line',
            data: {
                labels: delayData.map(d => {
                    var time = d[0];
                    var hours = Math.floor(time / 60);
                    // get minutes rounded to the nearest second decimal
                    var minutes = Math.round((time % 60) * 100) / 100;

                    // return formatted time
                    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                }),
                datasets: [{
                    label: '% Chance of Delay >= T',
                    data: dataPoints, // Use all y-values
                    borderColor: '#6a0dad',
                    backgroundColor: 'rgba(106, 13, 173, 0.1)',
                    tension: 0.8, // Smooth line
                    pointRadius: 0 // Hide markers
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Delay Duration T (HH:MM)'
                        },
                        ticks: {
                            callback: function(value, index, ticks) {
                                if (index % 300 == 0) {
                                    totalMinutes = index / 10.0;
                                    var hours = Math.floor(totalMinutes / 60);
                                    var totalMinutes = Math.round(totalMinutes % 60);
                                    return `${hours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}`;
                                }
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '% Chance of Delay >= T'
                        },
                        beginAtZero: true,
                    }
                }
            }
        });
    }
     
    const departureTimeInput = document.getElementById('departure-time');

    departureTimeInput.addEventListener('change', function() {
        // Validate time format HH:MM
        const time = this.value;
        const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

        if (time && !regex.test(time)) {
            alert("Please enter a valid time in HH:MM format.");
            this.value = ""; // Clear invalid input
        }
    });

    predictButton.addEventListener('click', predictDelays);
});
