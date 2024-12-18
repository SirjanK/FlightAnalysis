document.addEventListener('DOMContentLoaded', function() {
    const predictButton = document.getElementById('predict-button');
    const resultsDiv = document.getElementById('results');
    const delayPercentages = document.getElementById('delay-percentages');
    const delayChart = document.getElementById('delay-chart');

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

    predictButton.addEventListener('click', function() {
        // Mock data - replace with actual predictions later
        const mockPercentages = {
            '30min': '45%',
            '1hr': '30%',
            '2hrs': '15%'
        };

        // Update table
        delayPercentages.innerHTML = `
            <td>${mockPercentages['30min']}</td>
            <td>${mockPercentages['1hr']}</td>
            <td>${mockPercentages['2hrs']}</td>
        `;

        // Show results
        resultsDiv.style.display = 'block';

        // Create chart
        new Chart(delayChart, {
            type: 'line',
            data: {
                labels: ['00:30', '01:00', '01:30', '02:00', '02:30', '03:00'],
                datasets: [{
                    label: '% Chance of Delay >= T',
                    data: [45, 30, 25, 15, 10, 5],
                    borderColor: '#6a0dad',
                    backgroundColor: 'rgba(106, 13, 173, 0.1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Delay Duration T (hh:mm)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '% Chance of Delay >= T'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    });
});
