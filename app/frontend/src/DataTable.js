import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const DataTable = ({ delayData }) => {
  const thirtyMinProb = delayData.find(d => d[0] >= 30)?.[1] || 0;
  const oneHourProb = delayData.find(d => d[0] >= 60)?.[1] || 0;
  const twoHourProb = delayData.find(d => d[0] >= 120)?.[1] || 0;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>= 30 mins</TableCell>
            <TableCell>= 1hr</TableCell>
            <TableCell>= 2hrs</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{(thirtyMinProb * 100).toFixed(2)}%</TableCell>
            <TableCell>{(oneHourProb * 100).toFixed(2)}%</TableCell>
            <TableCell>{(twoHourProb * 100).toFixed(2)}%</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
