// DataTable.js
import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, styled } from '@mui/material';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: 'bold',
}));

const DataTable = ({ delayData }) => {
  return (
    <TableContainer component={Paper} elevation={3} sx={{ marginBottom: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell>Flight</StyledTableCell>
            <StyledTableCell>≥ 30 mins</StyledTableCell>
            <StyledTableCell>≥ 1hr</StyledTableCell>
            <StyledTableCell>≥ 2hrs</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {delayData.map((flight, index) => {
            const thirtyMinProb = flight.find(d => d[0] >= 30)?.[1] || 0;
            const oneHourProb = flight.find(d => d[0] >= 60)?.[1] || 0;
            const twoHourProb = flight.find(d => d[0] >= 120)?.[1] || 0;
            return (
              <TableRow key={index}>
                <TableCell>Flight {index + 1}</TableCell>
                <TableCell>{(thirtyMinProb * 100).toFixed(2)}%</TableCell>
                <TableCell>{(oneHourProb * 100).toFixed(2)}%</TableCell>
                <TableCell>{(twoHourProb * 100).toFixed(2)}%</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
