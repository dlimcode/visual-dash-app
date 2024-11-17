import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const LoadingDisplay = ({ message = 'Loading data...' }) => (
  <Box 
    display="flex" 
    flexDirection="column"
    justifyContent="center" 
    alignItems="center" 
    minHeight="400px"
  >
    <CircularProgress size={40} />
    <Typography variant="body1" sx={{ mt: 2 }}>
      {message}
    </Typography>
  </Box>
); 