import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ delayData }) => {
  const data = {
    labels: delayData.map(d => {
      const hours = Math.floor(d[0] / 60);
      const minutes = Math.round((d[0] % 60) * 100) / 100;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }),
    datasets: [{
      label: '% Chance of Delay >= T',
      data: delayData.map(d => d[1] * 100),
      borderColor: '#6a0dad',
      backgroundColor: 'rgba(106, 13, 173, 0.1)',
      tension: 0.8,
      pointRadius: 0
    }]
  };

  const options = {
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
              const totalMinutes = index / 10.0;
              const hours = Math.floor(totalMinutes / 60);
              const minutes = Math.round(totalMinutes % 60);
              return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
