import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Card, CardMedia, CardContent, Typography, Button, CircularProgress, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Nav from '../NavBar/Nav';

interface RoyalEnfieldFlyer {
  name: string;
  img: string;
  exploreLink: string;
  bookTestRideLink?: string;
}

const RoyalEnfieldPage = () => {
  const [flyers, setFlyers] = useState<RoyalEnfieldFlyer[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/flyers/royalenfield').then(res => {
      const data = res.data as { count: number; flyers: RoyalEnfieldFlyer[] };
      setFlyers(data.flyers || []);
      setCount(data.count || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', pb: 6 }}>
      {/* NavBar */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: '#fff', boxShadow: '0 2px 20px rgba(0,0,0,0.08)', height: '70px', display: 'flex', alignItems: 'center' }}>
        <Nav />
      </Box>
      <Box sx={{ pt: '90px', maxWidth: '1400px', mx: 'auto', px: 2 }}>
        {/* Back Button */}
        <Button
          variant="text"
          sx={{ mb: 2, fontWeight: 600, textTransform: 'none' }}
          onClick={() => navigate('/flyers')}
        >
          ← Back to Flyers
        </Button>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
          Royal Enfield Motorcycles
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ textAlign: 'center', color: '#64748b', mb: 2 }}>
          Total Models: {count}
        </Typography>
        <Divider sx={{ mb: 4 }} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
            gap: 3,
            justifyContent: 'center',
            alignItems: 'stretch',
          }}
        >
          {flyers.map((flyer, idx) => (
            <Card
              key={idx}
              sx={{
                width: '100%',
                maxWidth: 320,
                m: 'auto',
                borderRadius: '16px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-6px) scale(1.03)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                },
                display: 'flex',
                flexDirection: 'column',
                minHeight: 420,
              }}
            >
              <CardMedia
                component="img"
                height="180"
                image={flyer.img}
                alt={flyer.name}
                sx={{ objectFit: 'cover', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>{flyer.name}</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                  <Button
                    href={flyer.exploreLink}
                    target="_blank"
                    rel="noopener"
                    variant="contained"
                    sx={{ fontWeight: 600, borderRadius: '8px' }}
                  >
                    Explore
                  </Button>
                  {flyer.bookTestRideLink && (
                    <Button
                      href={flyer.bookTestRideLink}
                      target="_blank"
                      rel="noopener"
                      variant="outlined"
                      sx={{ fontWeight: 600, borderRadius: '8px' }}
                    >
                      Book a Test Ride
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default RoyalEnfieldPage;