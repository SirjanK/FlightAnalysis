// src/LineChart.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  LineController,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the necessary components
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, LineController, Tooltip, Legend);

// Line chart data generation
const generateChartData = () => {
  const tValues = [1, 2, 3]; // Different t values for the function e^(-tx)
  const labels = Array.from({ length: 100 }, (_, i) => i); // X-axis labels
  const datasets = tValues.map(t => ({
    label: `t = ${t}`,
    data: labels.map(x => (1 - Math.exp(-t * x / 10)).toFixed(2)), // e^(-tx)
    borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`,
    fill: false,
  }));

  return {
    labels,
    datasets,
  };
};

// LineChart component
const LineChart = () => {
  const chartData = generateChartData();

  return (
    <div>
      <h2>Line Chart</h2>
      <Line data={chartData} />
    </div>
  );
};

export default LineChart;

