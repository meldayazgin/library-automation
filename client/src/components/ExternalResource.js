import React, { useState, useEffect } from 'react';
import { fetchExternalResource, fetchDlnkResource } from '../utils/externalApi';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';

const ExternalResource = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const handleFetchDlnk = async () => {
    setLoading(true);
    setError('');
    try {
      // Using the specific ID from the error message
      const result = await fetchDlnkResource('7gBmdr805JL2');
      setData(result);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchExternal = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchExternalResource('https://dlnk.one/e?id=7gBmdr805JL2&type=1');
      setData(result);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        External Resource Demo
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={handleFetchDlnk}
          disabled={loading}
        >
          Fetch from dlnk.one
        </Button>
        
        <Button 
          variant="contained" 
          onClick={handleFetchExternal}
          disabled={loading}
        >
          Fetch External Resource
        </Button>
      </Box>
      
      {loading && <CircularProgress size={24} sx={{ my: 2 }} />}
      
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}
      
      {data && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Response:
          </Typography>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '300px'
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </Box>
      )}
    </Box>
  );
};

export default ExternalResource; 