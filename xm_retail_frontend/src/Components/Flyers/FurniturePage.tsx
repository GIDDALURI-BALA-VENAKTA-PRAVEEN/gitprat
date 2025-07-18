import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  CircularProgress,
  Alert
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { ArrowBack, Refresh } from '@mui/icons-material';
import Nav from '../NavBar/Nav';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

const fadeInScale = keyframes`
  from {
    opacity: 0;
    transform: scale(0.92) translateY(30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

// Marquee animation
const marquee = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

// Add a new keyframes for stairs effect
const stairsIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.92);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  paddingTop: '70px',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #fff8e1 100%)',
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

const LoadingSkeleton = styled(Box)(({ theme }) => ({
  height: '400px',
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  backgroundSize: '200% 100%',
  animation: `${shimmer} 1.5s infinite`,
  borderRadius: '16px',
}));

interface FurnitureBanner {
  url: string;
  alt?: string;
  title: string;
  source: string;
  type: string;
}

const shuffleArray = (array: any[]) => {
  // Fisher-Yates shuffle
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Add a styled Box for the stairs effect
const StairsImageBox = styled(Box)<{ offset: number; delay: number }>(({ offset, delay }) => ({
  width: '100%',
  aspectRatio: '3/4',
  overflow: 'hidden',
  background: '#fff',
  p: 0,
  m: 0,
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 0,
  lineHeight: 0,
  cursor: 'pointer',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  position: 'relative',
  left: `${offset * 18}px`, // offset each row for stairs effect
  animation: `${stairsIn} 0.7s cubic-bezier(0.4,0,0.2,1)`,
  animationDelay: `${delay}ms`,
  animationFillMode: 'both',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.04)',
    boxShadow: '0 6px 24px rgba(255,107,53,0.18)',
    zIndex: 2,
    filter: 'brightness(1.05)'
  }
}));

const StairsImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
  margin: 0,
  padding: 0,
  border: 'none',
  background: 'none',
  lineHeight: 0,
  fontSize: 0,
  verticalAlign: 'top',
  backgroundColor: '#fff',
});

const FurniturePage: React.FC = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<FurnitureBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:4000/api/flyers/furniture');
      const data = await response.json();
      
      if (data.success) {
        setBanners(shuffleArray(data.data || []));
      } else {
        setError('Failed to fetch furniture banners');
      }
    } catch (err) {
      console.error('Error fetching furniture banners:', err);
      setError('Unable to load furniture banners. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const response = await fetch('http://localhost:4000/api/flyers/furniture/refresh', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        setBanners(shuffleArray(data.data || []));
      } else {
        setError('Failed to refresh furniture banners');
      }
    } catch (err) {
      console.error('Error refreshing furniture banners:', err);
      setError('Unable to refresh furniture banners. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = 'https://via.placeholder.com/400x600/ff6b35/ffffff?text=IKEA+Furniture';
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <PageContainer>
      <NavContainer>
        <Nav />
      </NavContainer>
        
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/flyers')} 
            startIcon={<ArrowBack />}
            sx={{ 
              mb: 3, 
              fontWeight: 'bold', 
              fontSize: '1rem', 
              borderRadius: 2, 
              borderColor: '#ff6b35', 
              color: '#ff6b35', 
              '&:hover': { 
                background: '#fff8e1', 
                borderColor: '#f7931e' 
              } 
            }}
          >
            Back to Flyers
          </Button>
          
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2, 
              color: '#ff6b35',
              animation: `${fadeIn} 0.8s ease-out`
            }}
          >
            🏠 IKEA Furniture & Home Collection
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4, 
              color: '#555',
              animation: `${fadeIn} 0.8s ease-out`,
              animationDelay: '0.2s'
            }}
          >
            Discover amazing furniture deals and home furnishing offers from IKEA India. 
            From study tables to storage solutions, find everything you need for your home.
          </Typography>

          {/* Refresh Button */}
          <Button
            variant="contained"
            onClick={handleRefresh}
            disabled={refreshing}
            startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <Refresh />}
            sx={{
              background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: 2,
              '&:hover': {
                background: 'linear-gradient(45deg, #f7931e, #ff6b35)',
              },
              mb: 3
            }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Banners'}
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 4, borderRadius: '12px' }}
            action={
              <Button color="inherit" size="small" onClick={fetchBanners}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress sx={{ color: '#ff6b35' }} />
          </Box>
        ) : banners.length === 0 ? (
          <Typography sx={{ mt: 4, textAlign: 'center' }}>
            No furniture banners available at the moment.
          </Typography>
        ) : (
          <Box
            sx={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(5, 1fr)'
              },
              gap: 0,
              p: 0,
              m: 0,
              border: 'none',
              background: '#fff',
              lineHeight: 0,
              fontSize: 0,
              borderRadius: 0,
              boxShadow: 'none',
              overflow: 'hidden',
            }}
          >
            {banners.map((banner, idx) => {
              // Calculate row and offset for stairs effect
              const columns = 5; // match md: 5 columns
              const row = Math.floor(idx / columns);
              const offset = row % 2 === 0 ? 0 : 1; // odd rows offset
              return (
                <StairsImageBox
                  key={idx}
                  offset={offset}
                  delay={idx * 80}
                  onClick={() => {
                    if (banner.url) {
                      window.open(banner.url, '_blank');
                    }
                  }}
                >
                  <StairsImage
                    src={banner.url}
                    alt={banner.alt || banner.title || `IKEA Furniture ${idx + 1}`}
                    onError={handleImageError}
                  />
                </StairsImageBox>
              );
            })}
          </Box>
        )}

        {/* Info Section */}
        <Box sx={{ mt: 8, p: 4, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1e293b', textAlign: 'center', mb: 3 }}>
            🏠 Why Choose IKEA Furniture?
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, justifyContent: 'space-around' }}>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#ff6b35' }}>
                🏠 Quality Furniture
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Premium furniture and home furnishing solutions designed for modern living with durability and style.
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#f7931e' }}>
                💰 Best Prices
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Competitive pricing with regular offers, discounts, and special deals on furniture and home essentials.
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#10b981' }}>
                🚚 Free Delivery
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Free delivery on orders above Rs.1999 with professional assembly services available.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Footer Note */}
        <Box sx={{ textAlign: 'center', mt: 6, p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            💡 Pro Tip: Click on any banner to explore the latest IKEA furniture offers and home furnishing deals!
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default FurniturePage; 