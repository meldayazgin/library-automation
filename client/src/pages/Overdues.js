// src/pages/Overdues.js
import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { Container, Paper, Typography, Alert, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import moment from 'moment';

const Overdues = () => {
  const [overdues, setOverdues] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOverdues = async () => {
      try {
        const res = await axios.get('/borrowings/overdue');
        setOverdues(res.data);
      } catch (err) {
        setError('Error fetching overdue books');
      }
    };
    fetchOverdues();
  }, []);

  const columns = [
    { field: 'userId', headerName: 'User ID', flex: 1 },
    { field: 'bookId', headerName: 'Book ID', flex: 1 },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 150,
      valueFormatter: (params) => moment(params.value).format('MM/DD/YYYY')
    },
    {
      field: 'fine',
      headerName: 'Fine',
      width: 100,
      valueFormatter: (params) => `$${params.value || 0}`
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Overdue Books
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box sx={{ height: 400 }}>
          <DataGrid
            rows={overdues}
            columns={columns}
            getRowId={(row) => row.id}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default Overdues;
