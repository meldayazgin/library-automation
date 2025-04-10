import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const dummyBooks = [
  { id: '1', title: 'The Great Gatsby', available: 3 },
  { id: '2', title: '1984', available: 0 },
  { id: '3', title: 'To Kill a Mockingbird', available: 5 },
];

const dummyBorrowings = [
  { id: 'b1', bookTitle: '1984', status: 'borrowed', dueDate: '2024-04-05', fine: 2 },
  { id: 'b2', bookTitle: 'The Great Gatsby', status: 'returned', dueDate: '2024-03-10', fine: 0 },
  { id: 'b3', bookTitle: 'Mockingbird', status: 'overdue', dueDate: '2024-03-30', fine: 5 },
];

export default function LibraryDashboard() {
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState('');
  const [dueDate, setDueDate] = useState(dayjs().add(14, 'day'));
  const [borrowings, setBorrowings] = useState(dummyBorrowings);

  const handleBorrow = () => {
    setError('Borrow feature not connected.');
    setOpenDialog(false);
  };

  const handleReturn = (id) => {
    setBorrowings(prev =>
      prev.map(b =>
        b.id === id ? { ...b, status: 'returned', fine: 0 } : b
      )
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>📚 Library Dashboard</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Book Inventory */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">📖 Book Inventory</Typography>
            <ul>
              {dummyBooks.map(book => (
                <li key={book.id}>{book.title} - Available: {book.available}</li>
              ))}
            </ul>
            <Button
              variant="contained"
              onClick={() => setOpenDialog(true)}
              sx={{ mt: 2 }}
            >
              ➕ Borrow Book
            </Button>
          </Paper>
        </Grid>

        {/* Borrowings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">📝 My Borrowings</Typography>
            <ul style={{ paddingLeft: '1.2rem' }}>
              {borrowings.map(b => (
                <li key={b.id} style={{ marginBottom: '8px' }}>
                  {b.bookTitle} - Due: {b.dueDate}
                  <Chip
                    label={b.status}
                    size="small"
                    sx={{ ml: 1 }}
                    color={
                      b.status === 'overdue'
                        ? 'error'
                        : b.status === 'returned'
                        ? 'success'
                        : 'warning'
                    }
                  />
                  {b.fine > 0 && (
                    <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                      Fine: ${b.fine}
                    </Typography>
                  )}
                  {(b.status === 'borrowed' || b.status === 'overdue') && (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ ml: 2 }}
                      onClick={() => handleReturn(b.id)}
                    >
                      Return Book
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </Paper>
        </Grid>

        {/* Overdue Notification */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">📬 Overdue Notifications</Typography>
            <Box>
              <Alert severity="info">
                You have overdue books! Please return them to avoid additional fines.
              </Alert>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Borrow Book Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Borrow a Book</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Book</InputLabel>
            <Select
              value={selectedBook}
              label="Book"
              onChange={(e) => setSelectedBook(e.target.value)}
            >
              {dummyBooks.map(book => (
                <MenuItem key={book.id} value={book.id} disabled={book.available <= 0}>
                  {book.title} ({book.available} available)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Due Date"
              value={dueDate}
              onChange={(newValue) => setDueDate(newValue)}
              sx={{ mt: 3, width: '100%' }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleBorrow} variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
