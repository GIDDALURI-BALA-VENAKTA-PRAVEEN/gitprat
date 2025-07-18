import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, CircularProgress, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Nav from '../NavBar/Nav';

const GroceriesPage: React.FC = () => {
  const [dmartBanners, setDmartBanners] = useState<any[]>([]);
  const [ratnadeepBanners, setRatnadeepBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:4000/api/flyers/dmart').then(res => res.json()),
      fetch('http://localhost:4000/api/flyers/ratnadeep').then(res => res.json())
    ])
      .then(([dmartData, ratnadeepData]) => {
        setDmartBanners(Array.isArray(dmartData.data) ? dmartData.data : []);
        setRatnadeepBanners(Array.isArray(ratnadeepData.data) ? ratnadeepData.data : []);
        setMessage(dmartData.message || ratnadeepData.message || null);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load groceries banners.');
        setLoading(false);
      });
  }, []);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = 'https://via.placeholder.com/800x400/43a047/ffffff?text=Banner';
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%)', pt: '70px' }}>
      <Nav />
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
          ← Back to Flyers
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#388e3c' }}>
          Groceries & Daily Essentials
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: '#555' }}>
          Discover the latest offers on groceries, fresh produce, snacks, and more from DMart and Ratnadeep.
        </Typography>

        {message && (
          <Alert severity="info" sx={{ mb: 3 }}>{message}</Alert>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress color="success" />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ mt: 4 }}>{error}</Typography>
        ) : (
          <>
            {/* DMart Section */}
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 2, 
                fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.2rem' },
                background: 'linear-gradient(45deg, #388e3c, #4caf50, #66bb6a)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center',
                mt: 4
              }}
            >
              DMart
            </Typography>
            {dmartBanners.length === 0 ? (
              <Typography sx={{ mt: 2, mb: 4 }}>No DMart banners available at the moment.</Typography>
            ) : (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr' }, 
                gap: 3, mb: 6
              }}>
                {dmartBanners.slice(0, 5).map((banner, idx) => (
                  <Box key={idx} sx={{ 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    boxShadow: 2,
                    '&:hover': {
                      transform: 'scale(1.02)',
                      transition: 'transform 0.2s ease-in-out'
                    }
                  }}>
                    <img
                      src={banner.url}
                      alt={banner.alt || banner.title || 'DMart Banner'}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        objectFit: 'cover'
                      }}
                      onError={handleImageError}
                    />
                  </Box>
                ))}
              </Box>
            )}
            {/* Ratnadeep Section */}
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 2, 
                fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.2rem' },
                background: 'linear-gradient(45deg, #1e88e5, #43a047, #66bb6a)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center',
                mt: 4
              }}
            >
              Ratnadeep
            </Typography>
            {ratnadeepBanners.length === 0 ? (
              <Typography sx={{ mt: 2 }}>No Ratnadeep banners available at the moment.</Typography>
            ) : (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr' }, 
                gap: 3, mb: 6
              }}>
                {ratnadeepBanners.map((banner, idx) => (
                  <Box key={idx} sx={{ 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    boxShadow: 2,
                    '&:hover': {
                      transform: 'scale(1.02)',
                      transition: 'transform 0.2s ease-in-out'
                    }
                  }}>
                    <img
                      src={banner.url}
                      alt={banner.alt || banner.title || 'Ratnadeep Banner'}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        objectFit: 'cover'
                      }}
                      onError={handleImageError}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default GroceriesPage; 