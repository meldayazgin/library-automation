import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import {
  Container,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Box,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ReturnIcon } from '@mui/icons-material';
import moment from 'moment';

const Borrowings = () => {
  const { currentUser } = useAuth();
  const [borrowings, setBorrowings] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    bookId: '',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
  });

  const fetchData = async () => {
    try {
      const [borrowingsRes, booksRes] = await Promise.all([
        currentUser.role === 'admin'
          ? axios.get('/borrowings')
          : axios.get(`/borrowings/user/${currentUser.uid}`),
        axios.get('/books')
      ]);

      setBorrowings(borrowingsRes.data);
      setBooks(booksRes.data);
    } catch (error) {
      setError('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      bookId: '',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/borrowings', {
        ...formData,
        userId: currentUser.uid,
        dueDate: formData.dueDate.toISOString()
      });
      handleCloseDialog();
      fetchData();
    } catch (error) {
      setError('Error creating borrowing: ' + error.message);
    }
  };

  const handleReturn = async (id) => {
    try {
      await axios.put(`/borrowings/${id}/return`);
      fetchData();
    } catch (error) {
      setError('Error returning book: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'borrowed':
        return 'primary';
      case 'returned':
        return 'success';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      field: 'bookTitle',
      headerName: 'Book',
      flex: 1,
      valueGetter: (params) => {
        const book = books.find(b => b.id === params.row.bookId);
        return book ? book.title : 'Unknown';
      }
    },
    {
      field: 'borrowDate',
      headerName: 'Borrow Date',
      width: 150,
      valueFormatter: (params) =>
        moment(params.value).format('MM/DD/YYYY')
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 150,
      valueFormatter: (params) =>
        moment(params.value).format('MM/DD/YYYY')
    },
    {
      field: 'returnDate',
      headerName: 'Return Date',
      width: 150,
      valueFormatter: (params) =>
        params.value ? moment(params.value).format('MM/DD/YYYY') : '-'
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
        />
      )
    },
    {
      field: 'fine',
      headerName: 'Fine',
      width: 100,
      valueFormatter: (params) =>
        params.value ? `$${params.value.toFixed(2)}` : '$0.00'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        params.row.status === 'borrowed' && (
          <IconButton
            color="primary"
            onClick={() => handleReturn(params.row.id)}
            size="small"
          >
            <ReturnIcon />
          </IconButton>
        )
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Borrowings
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
          >
            Borrow Book
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={borrowings}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
            loading={loading}
          />
        </div>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Borrow a Book
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Book</InputLabel>
              <Select
                name="bookId"
                value={formData.bookId}
                label="Book"
                onChange={handleChange}
              >
                {books
                  .filter(book => book.available > 0)
                  .map(book => (
                    <MenuItem key={book.id} value={book.id}>
                      {book.title} ({book.available} available)
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                label="Due Date"
                value={formData.dueDate}
                onChange={(newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    dueDate: newValue
                  }));
                }}
                renderInput={(params) => (
                  <TextField {...params} fullWidth margin="normal" />
                )}
                minDate={moment()}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Borrow
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Borrowings; 