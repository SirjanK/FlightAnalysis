// src/CustomLineChart.js

import React from "react";
import { Chart } from "react-google-charts";

const CustomLineChart = ({ delayData }) => {
    // Prepare formatted data for the chart
    const formattedData = [];
    
    // Create headers
    const headers = ["Delay"];
    delayData.forEach((_, flightIndex) => {
        headers.push(`Flight ${flightIndex + 1}`);
    });
    formattedData.push(headers);

    // Populate data points
    delayData[0].forEach((point, index) => {
        const row = [point[0]]; // Delay time
        delayData.forEach(flight => {
            row.push(flight[index][1]); // Flight data
        });
        formattedData.push(row);
    });

    const options = {
        hAxis: { title: "Delay Time T (minutes)" },
        vAxis: { title: "Probability Delay > T" },
        series: {
          0: { color: "#FFA500" },
          1: { color: "#800080" },
          2: { color: "#006400" }
        },
        legend: { position: "top" },
        tooltip: {
          isHtml: true,
          trigger: 'hover',
          formatter: (row) => {
            const delayTime = Math.round(formattedData[row][0]); // Rounded minute
            const percentages = formattedData[row].slice(1).map((value, index) => 
                `Flight ${index + 1}: ${value}%`
            ).join("<br/>"); // Join with line breaks for HTML formatting

            return `<div style="padding: 10px;">
                        <strong>${delayTime} minutes</strong><br/>
                        ${percentages}
                    </div>`;
          },
        }
    };

    return (
        <div style={{ width: "100%", height: "400px" }}>
            <Chart
                chartType="LineChart"
                width="100%"
                height="100%"
                data={formattedData}
                options={options}
                // Custom tooltip formatting
                getTooltip={(row) => {
                  
                }}
            />
        </div>
    );
};

export default CustomLineChart;
