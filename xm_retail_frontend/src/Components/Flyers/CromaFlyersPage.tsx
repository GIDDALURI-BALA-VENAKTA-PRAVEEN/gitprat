import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, CircularProgress, Alert, Button, Card, CardContent, CardMedia, Chip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { ArrowBack, Star, LocalOffer, TrendingUp } from '@mui/icons-material';
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

const slideInFromBottom = keyframes`
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  paddingTop: '70px',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
}));

const NavContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  background: '#ffffff',
  boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
  animation: `${fadeIn} 0.5s ease-out`,
  height: '70px',
  display: 'flex',
  alignItems: 'center',
}));

const FlyerCard = styled(Box)(({ theme }) => ({
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '0px',
  background: 'transparent',
  margin: '0',
  padding: '0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  '&:hover': {
    transform: 'none',
  },
}));

const FlyerCardMedia = styled(Box)(({ theme }) => ({
  width: '100%',
  position: 'relative',
  margin: '0',
  padding: '0',
  transition: 'none',
  img: {
    width: '100%',
    height: 'auto',
    display: 'block',
    objectFit: 'contain',
  },
  '&:hover': {
    transform: 'none',
  },
}));

const LiveBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '8px',
  right: '8px',
  background: 'linear-gradient(45deg, #ff4444, #ff6b6b)',
  color: 'white',
  padding: theme.spacing(0.3, 0.8),
  borderRadius: '8px',
  fontSize: '0.6rem',
  fontWeight: 'bold',
  zIndex: 3,
  boxShadow: '0 2px 6px rgba(255, 68, 68, 0.2)',
  '&::before': {
    content: '""',
    display: 'inline-block',
    width: '4px',
    height: '4px',
    background: '#ffffff',
    borderRadius: '50%',
    marginRight: '4px',
  },
}));

const BackButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: '20px',
  left: '20px',
  zIndex: 10,
  background: 'rgba(255, 255, 255, 0.9)',
  color: '#ff6726',
  '&:hover': {
    background: 'rgba(255, 255, 255, 1)',
    transform: 'scale(1.05)',
  },
  transition: 'all 0.3s ease-in-out',
}));

const FlyersGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
  gap: '8px',
  padding: '8px',
  justifyContent: 'center',
  alignItems: 'start',
  alignContent: 'start',
  '& > *': {
    breakInside: 'avoid',
    marginBottom: '8px',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    maxWidth: '100%',
    margin: '0 auto',
  },
}));

const AnimatedContainer = styled(Box)(({ theme }) => ({
  animation: `${fadeIn} 0.8s ease-out`,
}));

const CromaFlyersPage: React.FC = () => {
  const navigate = useNavigate();
  const [flyers, setFlyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlyers = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:4000/api/flyers/croma");
        const data = await response.json();
        
        if (data.success) {
          setFlyers(data.data || []);
          setLastUpdate(data.timestamp ? new Date(data.timestamp).toLocaleString() : null);
        } else {
          setError('Failed to fetch Croma flyers');
        }
      } catch (err) {
        console.error('Error fetching Croma flyers:', err);
        setError('Failed to load Croma flyers');
      } finally {
        setLoading(false);
      }
    };

    fetchFlyers();
  }, []);

  const handleFlyerClick = (flyer: any) => {
    // Open flyer in new tab or handle click
    if (flyer.url) {
      window.open(flyer.url, '_blank');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <NavContainer>
          <Nav />
        </NavContainer>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} sx={{ color: '#ff6726' }} />
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
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3, fontWeight: 'bold', fontSize: '1rem', borderRadius: 2, borderColor: '#ff6726', color: '#ff6726', '&:hover': { background: '#fff5f0', borderColor: '#e55a1f' } }}>
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
            color: '#ff6726',
            animation: `${fadeIn} 0.5s ease-out`,
            fontSize: { xs: '1.8rem', md: '2.2rem' }
          }}
        >
          🛍️ Croma Flyers
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
          Latest electronics and gadgets offers from Croma
        </Typography>

    
    

        {flyers.length === 0 ? (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 6, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%)',
              borderRadius: 3,
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ color: '#ff6726', fontWeight: 'bold' }}>
              No Flyers Available
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Currently no flyers are available from Croma. Please check back later.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ 
                background: '#ff6726',
                '&:hover': { background: '#e55a1f' }
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
                background: 'linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%)',
                borderRadius: 2,
                border: '1px solid rgba(255, 103, 38, 0.1)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Star sx={{ color: '#ff6726', fontSize: '1.2rem' }} />
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#ff6726' }}>
                    {flyers.length} Active Flyers
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    icon={<LocalOffer />} 
                    label="Live Updates" 
                    size="small" 
                    sx={{ background: '#ff6726', color: 'white', fontSize: '0.7rem' }}
                  />
                  <Chip 
                    icon={<TrendingUp />} 
                    label="Fresh Deals" 
                    size="small" 
                    sx={{ background: '#ff6726', color: 'white', fontSize: '0.7rem' }}
                  />
                </Box>
              </Box>
            </Paper>

            {/* Flyers Grid */}
            <FlyersGrid>
              {flyers.map((flyer: any, index: number) => (
                <FlyerCard key={index} onClick={() => handleFlyerClick(flyer)}>
                  <FlyerCardMedia>
                    <img 
                      src={flyer.url} 
                      alt={`Flyer ${index + 1}`}
                      loading="lazy"
                    />
                  </FlyerCardMedia>
                </FlyerCard>
              ))}
            </FlyersGrid>

            {/* Footer Info */}
            <Paper 
              elevation={0} 
              sx={{ 
                mt: 6, 
                p: 4, 
                background: 'linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%)',
                borderRadius: 3,
                border: '1px solid rgba(255, 103, 38, 0.1)',
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#ff6726' }}>
                ℹ️ About Croma Flyers
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
                    Updated every 6 hours from Croma's official website
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

export default CromaFlyersPage; 