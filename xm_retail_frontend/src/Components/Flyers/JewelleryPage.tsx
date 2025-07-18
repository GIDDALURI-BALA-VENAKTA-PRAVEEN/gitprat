import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Nav from '../NavBar/Nav';

// Helper to group images by type/category
const groupByType = (banners) => {
  const groups = {};
  banners.forEach(banner => {
    const type = banner.type || 'Other';
    if (!groups[type]) groups[type] = [];
    groups[type].push(banner);
  });
  return groups;
};

const typeLabels = {
  banner: { title: 'Wedding Banners', color: '#d4af37', icon: '💍' },
  bridal: { title: 'Bridal Collection', color: '#ffd700', icon: '👰' },
  category: { title: 'Traditional Jewellery', color: '#b8860b', icon: '🏺' },
  jewellery: { title: 'Jewellery', color: '#b0a160', icon: '💎' },
  Other: { title: 'Other', color: '#aaa', icon: '🪙' }
};

const JewelleryPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:4000/api/flyers/jewellery')
      .then(res => res.json())
      .then(data => {
        setBanners(data.data || []);
        setMessage(data.message || null);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load jewellery banners.');
        setLoading(false);
      });
  }, []);

  const handleImageError = (event) => {
    event.currentTarget.src = 'https://via.placeholder.com/400x600/d4af37/ffffff?text=Jewellery+Banner';
  };

  // Group banners by type/category
  const grouped = groupByType(banners);
  const groupOrder = ['banner', 'bridal', 'category', 'jewellery', 'Other'];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #fff8e1 100%)', pt: '70px' }}>
      <Nav />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3, fontWeight: 'bold', fontSize: '1rem', borderRadius: 2, borderColor: '#d4af37', color: '#d4af37', '&:hover': { background: '#fff8e1', borderColor: '#b8860b' } }}>
           Back to Flyers
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#d4af37' }}>
          Wedding Jewellery Collection
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: '#555' }}>
          Discover the latest wedding jewellery collections, bridal sets, and traditional ornaments from Emmadi Silver Jewellery.
        </Typography>
        {message && (
          <Alert severity="info" sx={{ mb: 3 }}>{message}</Alert>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress sx={{ color: '#d4af37' }} />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ mt: 4 }}>{error}</Typography>
        ) : banners.length === 0 ? (
          <Typography sx={{ mt: 4 }}>No jewellery banners available at the moment.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {groupOrder.filter(type => grouped[type] && grouped[type].length > 0).map(type => {
              const group = grouped[type];
              const label = typeLabels[type] || typeLabels.Other;
              return (
                <Box key={type} sx={{ mb: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: label.color, mb: 2, textAlign: 'left' }}>
                    {label.icon} {label.title}
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: 'repeat(2, 1fr)',
                        sm: 'repeat(3, 1fr)',
                        md: 'repeat(5, 1fr)',
                        lg: 'repeat(6, 1fr)'
                      },
                      gap: 0,
                      p: 0,
                      m: 0,
                      border: 'none',
                      background: '#fff',
                      lineHeight: 0
                    }}
                  >
                    {group.map((banner, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          width: '100%',
                          aspectRatio: '3/4', // portrait flyer cell
                          overflow: 'hidden',
                          background: '#fff',
                          p: 0,
                          m: 0,
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <img
                          src={banner.url}
                          alt={banner.alt || banner.title || `${label.title} Banner`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            margin: 0,
                            padding: 0,
                            border: 'none',
                            background: 'none',
                            lineHeight: 0
                          }}
                          onError={handleImageError}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default JewelleryPage; 