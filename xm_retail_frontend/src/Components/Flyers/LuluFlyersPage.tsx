import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, CircularProgress, Alert, Button } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { ArrowBack, Star, LocalOffer } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Nav from '../NavBar/Nav';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  paddingTop: '80px',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
}));

const NavContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  background: '#ffffff',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  animation: `${fadeIn} 0.5s ease-out`,
}));

const FlyerContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.02)',
  },
  animation: `${scaleIn} 0.5s ease-out`,
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const FlyerImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: 'auto',
  display: 'block',
  objectFit: 'contain',
  objectPosition: 'center',
  transition: 'all 0.3s ease-in-out',
}));

const BackButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: '20px',
  left: '20px',
  zIndex: 10,
  background: 'rgba(255, 255, 255, 0.9)',
  color: '#6366f1',
  '&:hover': {
    background: 'rgba(255, 255, 255, 1)',
    transform: 'scale(1.05)',
  },
  transition: 'all 0.3s ease-in-out',
}));

const LuluFlyersPage: React.FC = () => {
  const navigate = useNavigate();
  const [flyers, setFlyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlyers = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:4000/api/flyers/lulu");
        const data = await response.json();
        
        if (data.success) {
          // Shuffle the flyers array to display them randomly
          const shuffledFlyers = data.data ? [...data.data].sort(() => Math.random() - 0.5) : [];
          setFlyers(shuffledFlyers);
          setLastUpdate(data.timestamp ? new Date(data.timestamp).toLocaleString() : null);
        } else {
          setError('Failed to fetch Lulu flyers');
        }
      } catch (err) {
        console.error('Error fetching Lulu flyers:', err);
        setError('Failed to load Lulu flyers');
      } finally {
        setLoading(false);
      }
    };

    fetchFlyers();
  }, []);

  const handleFlyerClick = (flyer: any) => {
    // Open flyer in new tab
    if (flyer.url) {
      window.open(flyer.url, '_blank');
    }
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Fallback to a placeholder image if the original fails to load
    event.currentTarget.src = 'https://via.placeholder.com/800x500/6366f1/ffffff?text=Lulu+Flyer';
  };

  if (loading) {
    return (
      <PageContainer>
        <NavContainer>
          <Nav />
        </NavContainer>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} sx={{ color: '#6366f1' }} />
          </Box>
        </Container>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <NavContainer>
          <Nav />
        </NavContainer>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button onClick={() => navigate('/flyers')} startIcon={<ArrowBack />}>
            Back to Flyers
          </Button>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <NavContainer>
        <Nav />
      </NavContainer>
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3, fontWeight: 'bold', fontSize: '1rem', borderRadius: 2, borderColor: '#6366f1', color: '#6366f1', '&:hover': { background: '#f0f2ff', borderColor: '#5855eb' } }}>
           Back to Flyers
        </Button>

        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          align="center" 
          sx={{ 
            mb: 2, 
            fontWeight: 'bold',
            color: '#6366f1',
            animation: `${fadeIn} 0.5s ease-out`,
            fontSize: { xs: '1.8rem', md: '2.2rem' }
          }}
        >
          🏬 Lulu Mall Flyers
        </Typography>
        
        <Typography 
          variant="h6" 
          align="center" 
          sx={{ 
            mb: 4, 
            color: '#666666',
            animation: `${fadeIn} 0.5s ease-out`,
            animationDelay: '0.2s',
            fontSize: { xs: '0.9rem', md: '1rem' }
          }}
        >
          Latest fashion, lifestyle, and entertainment offers from Lulu Mall
        </Typography>

        {flyers.length === 0 ? (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 6, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f0f2ff 0%, #e6e9ff 100%)',
              borderRadius: 3,
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ color: '#6366f1', fontWeight: 'bold' }}>
              No Flyers Available
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Currently no flyers are available from Lulu Mall. Please check back later.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ 
                background: '#6366f1',
                '&:hover': { background: '#5855eb' }
              }}
            >
              Refresh
            </Button>
          </Paper>
        ) : (
          <>
            {/* Stats Bar */}
            <Paper 
              elevation={0} 
              sx={{ 
                mb: 4, 
                p: 2, 
                background: 'linear-gradient(135deg, #f0f2ff 0%, #e6e9ff 100%)',
                borderRadius: 2,
                border: '1px solid rgba(99, 102, 241, 0.1)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Star sx={{ color: '#6366f1', fontSize: '1.2rem' }} />
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#6366f1' }}>
                    {flyers.length} Active Flyers
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <LocalOffer sx={{ color: '#6366f1', fontSize: '1.2rem' }} />
                  <Typography variant="body2" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
                    Fashion & Lifestyle
                  </Typography>
                </Box>
                {lastUpdate && (
                  <Typography variant="caption" sx={{ color: '#6366f1' }}>
                    Last updated: {lastUpdate}
                  </Typography>
                )}
              </Box>
            </Paper>

            {/* Flyers Grid - 2 Images Side by Side */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(2, 1fr)', 
                lg: 'repeat(2, 1fr)' 
              },
              gap: 2,
              width: '100%'
            }}>
              {flyers.map((flyer, index) => (
                <FlyerContainer key={index} onClick={() => handleFlyerClick(flyer)}>
                  <ImageContainer>
                    <FlyerImage
                      src={flyer.url}
                      alt={flyer.title || flyer.alt || `Lulu Flyer ${index + 1}`}
                      onError={handleImageError}
                      loading="lazy"
                    />
                  </ImageContainer>
                </FlyerContainer>
              ))}
            </Box>

            {/* Info Section */}
            <Paper 
              elevation={0} 
              sx={{ 
                mt: 6, 
                p: 4, 
                background: 'linear-gradient(135deg, #f0f2ff 0%, #e6e9ff 100%)',
                borderRadius: 3,
                border: '1px solid rgba(99, 102, 241, 0.1)',
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#6366f1' }}>
                ℹ️ About Lulu Mall Flyers
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 3 
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ mb: 1 }}>🔄</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Live Updates
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Updated every 6 hours from Lulu Mall's official website
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ mb: 1 }}>⚡</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Fast Loading
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cached for quick access while maintaining freshness
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ mb: 1 }}>🛡️</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Reliable
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fallback data ensures you always see content
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </>
        )}
      </Container>
    </PageContainer>
  );
};

export default LuluFlyersPage; 