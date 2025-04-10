import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Delete as DeleteIcon } from '@mui/icons-material';
import axios from '../utils/axios';

const Library = () => {
  const [books, setBooks] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    quantity: '',
    description: ''
  });
  const [selectedBookId, setSelectedBookId] = useState('');

  const fetchBooks = async () => {
    try {
      const res = await axios.get('/books');
      setBooks(res.data);
    } catch (err) {
      console.error('Error fetching books:', err.message);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleOpenAddDialog = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: '',
      quantity: '',
      description: ''
    });
    setOpenAddDialog(true);
  };

  const handleOpenRemoveDialog = () => {
    setSelectedBookId('');
    setOpenRemoveDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenRemoveDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post('/books', formData);
      fetchBooks();
      handleCloseDialogs();
    } catch (err) {
      console.error('Error adding book:', err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this book?')) {
      try {
        await axios.delete(`/books/${id}`);
        fetchBooks();
      } catch (err) {
        console.error('Error deleting book:', err.message);
      }
    }
  };

  const handleRemoveSelectedBook = async () => {
    if (!selectedBookId) return;
    await handleDelete(selectedBookId);
    handleCloseDialogs();
  };

  const columns = [
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'author', headerName: 'Author', flex: 1 },
    { field: 'isbn', headerName: 'ISBN', flex: 1 },
    { field: 'category', headerName: 'Category', flex: 1 },
    { field: 'quantity', headerName: 'Qty', width: 80 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Library</Typography>
          <Box>
            <Button variant="contained" onClick={handleOpenAddDialog} sx={{ mr: 1 }}>
              Add Book
            </Button>
            <Button variant="contained" color="error" onClick={handleOpenRemoveDialog}>
              Remove Book
            </Button>
          </Box>
        </Box>

        <DataGrid
          rows={books}
          columns={columns}
          autoHeight
          pageSize={5}
          rowsPerPageOptions={[5]}
        />
      </Paper>

      {/* Add Book Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Add Book</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField fullWidth margin="normal" label="Title" name="title" value={formData.title} onChange={handleChange} />
            <TextField fullWidth margin="normal" label="Author" name="author" value={formData.author} onChange={handleChange} />
            <TextField fullWidth margin="normal" label="ISBN" name="isbn" value={formData.isbn} onChange={handleChange} />
            <TextField fullWidth margin="normal" label="Category" name="category" value={formData.category} onChange={handleChange} />
            <TextField fullWidth margin="normal" label="Quantity" type="number" name="quantity" value={formData.quantity} onChange={handleChange} />
            <TextField fullWidth margin="normal" label="Description" name="description" multiline rows={3} value={formData.description} onChange={handleChange} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Remove Book Dialog */}
      <Dialog open={openRemoveDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Remove Book</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Book</InputLabel>
            <Select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              label="Select Book"
            >
              {books.map((book) => (
                <MenuItem key={book.id} value={book.id}>
                  {book.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRemoveSelectedBook}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Library;
