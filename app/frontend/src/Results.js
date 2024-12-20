import React from 'react';
import DataTable from './DataTable';
import LineChart from './LineChart';

const Results = ({ delayData }) => {
  return (
      <div>
          <h2>Delay Probability</h2>
          <DataTable delayData={delayData} />
          <LineChart delayData={delayData} />
      </div>
  );
};

export default Results;
