import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import ExternalResource from '../components/ExternalResource';

const Dashboard = () => {
  const { currentUser } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Message */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h1" variant="h4" color="primary" gutterBottom>
              Welcome, {currentUser?.name || 'User'}!
            </Typography>
            <Typography variant="body1">
              This is your library dashboard. Here you can manage books, borrowings, and more.
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                My Active Borrowings
              </Typography>
              <Typography variant="h5" component="div">
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Books Due Soon
              </Typography>
              <Typography variant="h5" component="div">
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Books Read
              </Typography>
              <Typography variant="h5" component="div">
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Recent Activity
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              No recent activity to display.
            </Typography>
          </Paper>
        </Grid>

        {/* External Resource Demo */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                External Resource Demo
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This section demonstrates how to handle external API requests through our proxy.
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <ExternalResource />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 