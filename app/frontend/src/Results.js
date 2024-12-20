import React from 'react';
import DataTable from './DataTable';
import CustomLineChart from './CustomLineChart';
import { Typography } from '@mui/material';

const Results = ({ delayData }) => {
  return (
    <div>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', marginTop: 4 }}>
        Delay Probability
      </Typography>
      <DataTable delayData={delayData} />
      <CustomLineChart delayData={delayData} />
    </div>
  );
};

export default Results;
