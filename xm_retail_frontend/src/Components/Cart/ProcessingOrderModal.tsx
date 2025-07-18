import React from 'react';
import { Modal, Box, CircularProgress, Typography } from '@mui/material';

export default function ProcessingOrderModal({ open = true }) {
  return (
    <Modal open={open}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          bgcolor: 'rgba(255,255,255,0.95)',
          zIndex: 2000,
        }}
      >
        <CircularProgress size={60} sx={{ color: '#ff6726' }} />
        <Typography variant="h6" sx={{ mt: 3, fontWeight: 'bold', color: '#ff6726' }}>
          Processing your order…
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: '#888', textAlign: 'center', maxWidth: 320 }}>
          Please wait while we confirm your payment and fetch your cards. This may take a few seconds.
        </Typography>
      </Box>
    </Modal>
  );
} 