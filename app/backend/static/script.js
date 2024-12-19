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
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.error);
                });
            }
            return response.json();
        })
        .then(data => {
            updateResults(data.delay_data);
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorDialog(error.message || "We couldn't process your request. Please try again.");
        });
    }

    function showErrorDialog(message) {
        alert(message);
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
     
    predictButton.addEventListener('click', function() {
        document.getElementById('prediction-form').requestSubmit();
    });

    // create and attach typeahead functionality
    function setupTypeahead(inputId, dataList) {
        const input = document.getElementById(inputId);
        const datalist = document.createElement('datalist');
        datalist.id = inputId + '-list';
        input.setAttribute('list', datalist.id);

        dataList.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            datalist.appendChild(option);
        });

        input.parentNode.insertBefore(datalist, input.nextSibling);

        input.addEventListener('input', function() {
            const value = this.value.toLowerCase();
            const options = datalist.querySelectorAll('option');
            options.forEach(option => {
                if (option.value.toLowerCase().includes(value)) {
                    option.style.display = '';
                } else {
                    option.style.display = 'none';
                }
            });
        });
    }

    // validate input
    function validateInput(input, validOptions) {
        if (input.value === "" || validOptions.includes(input.value)) {
            return true;
        }
        alert(`Please select a valid option for ${input.name} or leave it empty.`);
        input.value = '';
        return false;
    }

    // Fetch options from server
    fetch('/get_options')
        .then(response => response.json())
        .then(data => {
            setupTypeahead('origin', data.airports);
            setupTypeahead('destination', data.airports);
            setupTypeahead('airline', data.airlines);

            // Add validation to the form submission
            document.getElementById('prediction-form').addEventListener('submit', function(e) {
                e.preventDefault();
                const origin = document.getElementById('origin');
                const destination = document.getElementById('destination');
                const airline = document.getElementById('airline');
            
                if (validateInput(origin, data.airports) &&
                    validateInput(destination, data.airports) &&
                    validateInput(airline, data.airlines)) {
                    predictDelays();
                }
            });
        })
        .catch(error => console.error('Error:', error));
});
