import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const colors = ['#8884d8', '#82ca9d', '#ffc658']; // Add more colors if needed

const CustomLineChart = ({ delayData }) => {
  if (delayData.length === 0) {
    // exit
    return null;
  }
  const formattedData = delayData[0].map((point, index) => ({
    delay: point[0],
    ...delayData.reduce((acc, flight, flightIndex) => {
      acc[`Flight ${flightIndex + 1}`] = flight[index][1];
      return acc;
    }, {})
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="delay" />
        <YAxis />
        <Tooltip />
        <Legend />
        {delayData.map((_, index) => (
          <Line 
            key={index}
            type="monotone" 
            dataKey={`Flight ${index + 1}`} 
            stroke={colors[index % colors.length]} 
            activeDot={{ r: 8 }} 
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CustomLineChart;
