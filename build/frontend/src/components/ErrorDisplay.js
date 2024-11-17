import React from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

export const ErrorDisplay = ({ 
  message, 
  section, 
  onRetry 
}) => (
  <Paper 
    sx={{ 
      p: 3, 
      backgroundColor: 'error.light', 
      color: 'error.contrastText',
      display: 'flex',
      alignItems: 'center',
      gap: 2
    }}
  >
    <ErrorIcon color="error" sx={{ fontSize: 40 }} />
    <Box>
      <Typography variant="h6" gutterBottom>
        {section} Data Unavailable
      </Typography>
      <Typography variant="body1">
        {message}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
        Please try refreshing the page or contact support if the problem persists.
      </Typography>
      {onRetry && (
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{ bgcolor: 'error.dark' }}
        >
          Retry Loading
        </Button>
      )}
    </Box>
  </Paper>
); 