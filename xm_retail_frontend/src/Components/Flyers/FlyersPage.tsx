import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, Card, CardContent, CardMedia, Button, Chip, Avatar, IconButton } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { ShoppingCart, Store, LocalOffer, Star, TrendingUp, FlashOn, ArrowBack, Create, Palette } from '@mui/icons-material';
import Nav from '../NavBar/Nav';
import FashionImg from '../categories/assets/imgs/Fashion.png';
import { keyframes as muiKeyframes } from '@mui/system';

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

const scaleIn = keyframes`
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
  100% {
    transform: translateY(0px);
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

// Animation for card appearance
const flyerFadeIn = muiKeyframes`
  from { opacity: 0; transform: scale(0.95) translateY(30px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
`;

// Animation for image zoom on hover
const flyerZoom = muiKeyframes`
  from { transform: scale(1); }
  to { transform: scale(1.07); }
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

const StoreCard = styled(Card)(({ theme }) => ({
  height: '320px',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${scaleIn} 0.6s ease-out`,
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '12px',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s ease-in-out',
    zIndex: 1,
  },
  '&:hover::before': {
    transform: 'translateX(100%)',
  },
}));

const StoreCardMedia = styled(CardMedia)(({ theme }) => ({
  height: '120px',
  position: 'relative',
  '&::after': {
    content: '""',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 100%)',
    zIndex: 1,
  },
}));

const StoreLogo = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '8px',
  left: '8px',
  zIndex: 2,
  background: 'rgba(255,255,255,0.95)',
  padding: theme.spacing(0.5, 1.2),
  borderRadius: '8px',
  boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
  animation: `${float} 4s ease-in-out infinite`,
  backdropFilter: 'blur(10px)',
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
  zIndex: 2,
  animation: `${fadeIn} 0.5s ease-out`,
  boxShadow: '0 2px 6px rgba(255, 68, 68, 0.2)',
  '&::before': {
    content: '""',
    display: 'inline-block',
    width: '4px',
    height: '4px',
    background: '#ffffff',
    borderRadius: '50%',
    marginRight: '4px',
    animation: 'pulse 2s infinite',
  },
}));

const OfferChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '0.55rem',
  height: '20px',
  '&:hover': {
    transform: 'scale(1.05)',
  },
  transition: 'all 0.3s ease-in-out',
}));

const FlyersPage: React.FC = () => {
  const navigate = useNavigate();
  const [postedFlyers, setPostedFlyers] = useState<any[]>([]);

  // Fetch posted flyers from backend
  useEffect(() => {
    fetch('/api/posted-flyers')
      .then(res => res.json())
      .then(data => setPostedFlyers(data))
      .catch(() => setPostedFlyers([]));

    // Optional: Listen for custom event to update posted flyers in real-time
    const handler = () => {
      fetch('/api/posted-flyers')
        .then(res => res.json())
        .then(data => setPostedFlyers(data));
    };
    window.addEventListener('flyer-posted', handler);
    return () => window.removeEventListener('flyer-posted', handler);
  }, []);

  const stores = [
    {
      id: 'croma',
      name: 'Croma',
      logo: '🛍️',
      description: 'India\'s leading electronics retailer with exclusive deals on smartphones, laptops, home appliances, and gadgets. Get the best prices with instant discounts and exchange offers.',
      image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      path: '/flyers/croma',
      color: '#ff6726',
      primaryColor: '#ff6b35',
      offers: [
        { text: 'Up to 50% OFF', icon: <LocalOffer /> },
        { text: 'Exchange Bonus', icon: <TrendingUp /> },
        { text: 'Free Delivery', icon: <ShoppingCart /> }
      ],
      features: ['Electronics', 'Gadgets', 'Home Appliances', 'Smartphones', 'Laptops'],
      rating: 4.5,
      reviews: '2.5K+',
      location: 'Pan India',
      website: 'https://www.croma.com/'
    },
    {
      id: 'lulu',
      name: 'Lulu Mall',
      logo: '🏬',
      description: 'Hyderabad\'s premier grocery and food market featuring fresh produce, daily essentials, and local delicacies. Experience quality shopping with exclusive offers on groceries and household items.',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      path: '/flyers/lulu',
      color: '#6366f1',
      primaryColor: '#8b5cf6',
      offers: [
        { text: 'Fresh Produce', icon: <Star /> },
        { text: 'Daily Essentials', icon: <FlashOn /> },
        { text: 'Local Delicacies', icon: <Store /> }
      ],
      features: ['Groceries', 'Fresh Produce', 'Household', 'Local Food', 'Essentials'],
      rating: 4.8,
      reviews: '1.2K+',
      location: 'Hyderabad',
      website: 'https://www.hyderabad.lulumall.in/'
    },
    {
      id: 'sarathcity',
      name: 'Sarath City Capital Mall',
      logo: '🏢',
      description: 'Hyderabad\'s largest shopping mall featuring premium brands, entertainment zones, and dining experiences. Discover exclusive offers on fashion, electronics, and lifestyle products.',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      path: '/flyers/sarathcity',
      color: '#667eea',
      primaryColor: '#764ba2',
      offers: [
        { text: 'Seasonal Sales', icon: <LocalOffer /> },
        { text: 'Premium Brands', icon: <Star /> },
        { text: 'Entertainment', icon: <FlashOn /> }
      ],
      features: ['Fashion', 'Electronics', 'Entertainment', 'Dining', 'Lifestyle'],
      rating: 4.7,
      reviews: '1.8K+',
      location: 'Hyderabad',
      website: 'https://sarathcitycapitalmall.com/'
    },
    {
      id: 'groceries',
      name: 'Groceries',
      logo: '🛒',
      description: 'Fresh groceries, daily essentials, and unbeatable prices. Shop fruits, vegetables, snacks, and more from DMart with exclusive offers.',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      path: '/flyers/groceries',
      color: '#43a047',
      primaryColor: '#66bb6a',
      offers: [
        { text: 'Up to 40% OFF', icon: <LocalOffer /> },
        { text: 'Fresh Stock', icon: <TrendingUp /> },
        { text: 'Everyday Essentials', icon: <Star /> }
      ],
      features: ['Fruits', 'Vegetables', 'Snacks', 'Essentials', 'Dairy'],
      rating: 4.7,
      reviews: '4.2K+',
      location: 'Pan India',
      website: 'https://www.dmart.in/'
    },
    {
      id: 'jewellery',
      name: 'Emmadi Jewellery',
      logo: '💎',
      description: 'India\'s largest silver jewellery brand offering exquisite wedding collections, bridal sets, and traditional ornaments. Discover timeless elegance with exclusive designs.',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      path: '/flyers/jewellery',
      color: '#d4af37',
      primaryColor: '#ffd700',
      offers: [
        { text: 'Wedding Collection', icon: <Star /> },
        { text: 'Bridal Sets', icon: <FlashOn /> },
        { text: 'Traditional Designs', icon: <Store /> }
      ],
      features: ['Wedding Jewellery', 'Bridal Sets', 'Necklaces', 'Earrings', 'Bangles'],
      rating: 4.9,
      reviews: '3.1K+',
      location: 'Hyderabad & Pan India',
      website: 'https://www.emmadisilverjewellery.in/'
    },
    {
      id: 'furniture',
      name: 'IKEA Furniture',
      logo: '🏠',
      description: 'India\'s leading furniture and home furnishing retailer offering quality furniture, storage solutions, and home decor. Get the best prices with free delivery on orders above Rs.1999.',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      path: '/flyers/furniture',
      color: '#ff6b35',
      primaryColor: '#f7931e',
      offers: [
        { text: 'Free Delivery', icon: <ShoppingCart /> },
        { text: 'Quality Furniture', icon: <Star /> },
        { text: 'Home Essentials', icon: <Store /> }
      ],
      features: ['Furniture', 'Storage', 'Home Decor', 'Kitchen', 'Bedroom'],
      rating: 4.8,
      reviews: '5.2K+',
      location: 'Pan India',
      website: 'https://www.ikea.com/in/en/'
    },
    {
      id: 'swiggy',
      name: 'Swiggy Food Offers',
      logo: '🍲',
      description: 'Discover the best food offers, restaurant deals, and exclusive Swiggy discounts in your city. Updated live based on your location!',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      path: '/flyers/swiggy',
      color: '#fc8019',
      primaryColor: '#ffb74d',
      offers: [
        { text: 'Live Food Deals', icon: <LocalOffer /> },
        { text: 'Location Based', icon: <FlashOn /> },
        { text: 'Top Restaurants', icon: <Star /> }
      ],
      features: ['Biryani', 'Pizza', 'Desserts', 'Fast Food', 'Healthy'],
      rating: 4.6,
      reviews: '10K+',
      location: 'Pan India',
      website: 'https://www.swiggy.com/'
    },
    {
      id: 'royalenfield',
      name: 'Royal Enfield Motorcycles',
      logo: '🏍️',
      description: 'Explore the latest Royal Enfield motorcycles, specs, and offers.',
      image: 'https://www.royalenfield.com/content/dam/royal-enfield/motorcycles/classic-650/motorcycles-700x550.jpg',
      path: '/flyers/royalenfield',
      color: '#222',
      primaryColor: '#444',
      offers: [
        { text: 'New Launches', icon: <Star /> },
        { text: 'Book a Test Ride', icon: <FlashOn /> },
        { text: 'Official Store', icon: <Store /> }
      ],
      features: ['Motorcycles', 'Test Ride', 'Specs', 'Offers'],
      rating: 4.9,
      reviews: '5K+',
      location: 'Pan India',
      website: 'https://www.royalenfield.com/in/en/motorcycles/'
    },
    {
      id: 'accessories',
      name: 'Luxury Accessories',
      logo: '⌚',
      description: 'Discover premium watches and accessories from top brands. Explore exclusive timepieces, jewelry, and more.',
      image: 'https://www.luxurybazaar.com/cdn/uploads/2025/06/ROLEX_126711CHNR_314994_1a.jpg',
      path: '/flyers/accessories',
      color: '#b48856',
      primaryColor: '#e0c097',
      offers: [
        { text: 'Certified Pre-Owned', icon: <Star /> },
        { text: 'Luxury Brands', icon: <LocalOffer /> },
        { text: 'Exclusive Deals', icon: <FlashOn /> }
      ],
      features: ['Watches', 'Jewelry', 'Luxury', 'Certified', 'Exclusive'],
      rating: 4.9,
      reviews: '1.1K+',
      location: 'Global',
      website: 'https://www.luxurybazaar.com/'
    }
  ];

  const handleStoreClick = (path: string) => {
    navigate(path);
  };

  const handleStudioClick = () => {
    navigate('/studio');
  };

  return (
    <PageContainer>
      <NavContainer>
        <Nav />
      </NavContainer>
        
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          {/* Back Button and Studio Button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <IconButton
              onClick={() => navigate('/')}
              sx={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(45deg, #764ba2, #667eea)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                },
                transition: 'all 0.3s ease-in-out',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)',
              }}
            >
              <ArrowBack />
            </IconButton>

            {/* Studio Button */}
            <Button
              variant="contained"
              startIcon={<Create />}
              onClick={handleStudioClick}
              sx={{
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                color: 'white',
                fontWeight: 'bold',
                px: 3,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #f7931e, #ff6b35)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)',
                },
                transition: 'all 0.3s ease-in-out',
                animation: `${float} 4s ease-in-out infinite`,
              }}
            >
              🎨 Create Flyers for Free
            </Button>
          </Box>
          
        <Typography 
            variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
              fontWeight: '700',
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: `${fadeIn} 0.8s ease-out`,
              fontSize: { xs: '1.8rem', md: '2.2rem' }
            }}
          >
            Exclusive Offers & Flyers
        </Typography>
        
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3, 
              color: '#64748b',
              fontWeight: '400',
              animation: `${fadeIn} 0.8s ease-out`,
              animationDelay: '0.2s',
              maxWidth: '500px',
              mx: 'auto',
              lineHeight: 1.5,
              fontSize: { xs: '0.9rem', md: '1rem' }
            }}
          >
            Discover amazing deals and promotions from your favorite stores. 
            Get the latest flyers with exclusive discounts and offers.
          </Typography>

          {/* Stats Section */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 3, 
            mt: 3,
            flexWrap: 'wrap'
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ff6726', fontSize: '1.2rem' }}>{stores.length}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Premium Stores</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#6366f1', fontSize: '1.2rem' }}>24/7</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Live Updates</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.2rem' }}>50%+</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Max Discounts</Typography>
            </Box>
          </Box>

          {/* Studio Promotional Banner */}
          <Paper 
            elevation={0} 
            sx={{ 
              mt: 4, 
              p: 3, 
              background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(255, 107, 53, 0.3)',
              animation: `${fadeIn} 0.8s ease-out`,
              animationDelay: '0.4s',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: `${float} 4s ease-in-out infinite`,
                }}>
                  <Palette sx={{ fontSize: '2rem', color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
                    🎨 Create Your Own Flyers
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Design professional flyers for free with our easy-to-use studio
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<Create />}
                onClick={handleStudioClick}
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  border: '2px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                Start Creating →
              </Button>
            </Box>
          </Paper>

          {/* Posted Flyers Grid Gallery */}
          {postedFlyers.length > 0 && (
            <Box sx={{ mt: 4, mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#ff6726', textAlign: 'left' }}>
                Posted Flyers
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
                  gap: 3,
                  justifyContent: 'center',
                  alignItems: 'start',
                }}
              >
                {postedFlyers.map((flyer, idx) => {
                  // Strong pastel color palette for card backgrounds
                  const cardColors = [
                    '#b3e5fc', // blue
                    '#ffe082', // yellow
                    '#c8e6c9', // green
                    '#ffccbc', // orange
                    '#d1c4e9', // purple
                    '#f8bbd0', // pink
                  ];
                  const cardBg = cardColors[idx % cardColors.length];
                  const borderColor = '#ffb74d';
                  // Details section: slightly darker or semi-transparent overlay
                  const detailsBg = 'rgba(255,255,255,0.85)';
                  // Use flyer.width and flyer.height for aspect ratio
                  const aspectRatio = flyer.width && flyer.height ? `${flyer.width} / ${flyer.height}` : '1 / 1.4';
                  return (
                    <Paper
                      key={flyer.id || idx}
                      elevation={6}
                      sx={{
                        p: 0,
                        borderRadius: 4,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 6px 24px rgba(255,107,53,0.10)',
                        background: cardBg,
                        border: `2.5px solid ${borderColor}`,
                        animation: `${flyerFadeIn} 0.7s cubic-bezier(0.4,0,0.2,1)`,
                        animationDelay: `${idx * 0.08}s`,
                        animationFillMode: 'backwards',
                        transition: 'transform 0.25s, box-shadow 0.25s',
                        '&:hover': {
                          transform: 'translateY(-10px) scale(1.03)',
                          boxShadow: '0 16px 40px rgba(255,107,53,0.18)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          aspectRatio: aspectRatio,
                          background: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        <Box
                          component="img"
                          src={flyer.previewImageUrl}
                          alt={flyer.title}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain', // Show full image without cropping
                            transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
                            borderRadius: 0,
                            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                            background: '#fff',
                            '&:hover': {
                              animation: `${flyerZoom} 0.5s forwards`,
                            },
                          }}
                        />
                      </Box>
                      <Box sx={{
                        p: 2.2,
                        width: '100%',
                        textAlign: 'center',
                        background: detailsBg,
                        borderBottomLeftRadius: 16,
                        borderBottomRightRadius: 16,
                        boxShadow: '0 2px 8px rgba(255,107,53,0.04)',
                        minHeight: 110,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderTop: `1.5px solid ${borderColor}`,
                      }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: '#ff6b35', fontSize: '1.15rem', letterSpacing: 0.2 }}>{flyer.title}</Typography>
                        <Typography variant="body2" sx={{ color: '#888', fontSize: 15, mb: 0.5, fontWeight: 500 }}>By: {flyer.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#aaa', fontSize: 13, fontWeight: 400 }}>
                          Posted: {flyer.createdAt ? new Date(flyer.createdAt).toLocaleString() : ''}
                        </Typography>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            </Box>
          )}

        </Box>

        {/* Store Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, 
          gap: 2, 
          justifyContent: 'center',
          maxWidth: '1400px',
          mx: 'auto'
        }}>
          {stores.map((store, index) => (
            <Box key={store.id} sx={{ animationDelay: `${index * 0.2}s` }}>
              <StoreCard 
                onClick={() => handleStoreClick(store.path)}
                sx={{ 
                  border: `2px solid transparent`,
                  '&:hover': {
                    border: `2px solid ${store.color}`,
                  }
                }}
              >
                <StoreCardMedia
                  image={store.image}
                  title={store.name}
                />
                
                <StoreLogo>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: store.color, fontSize: '0.8rem' }}>
                    {store.logo} {store.name}
                  </Typography>
                </StoreLogo>
                
                <LiveBadge>
                  LIVE
                </LiveBadge>
                
                <CardContent sx={{ p: 2, position: 'relative', zIndex: 2 }}>
                  {/* Rating and Reviews */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 0.8 }}>
                      <Star sx={{ color: '#fbbf24', fontSize: '0.8rem', mr: 0.2 }} />
                      <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}>
                        {store.rating}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                      ({store.reviews})
                    </Typography>
                    <Box sx={{ ml: 'auto' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                        📍 {store.location}
              </Typography>
                    </Box>
                  </Box>

                  {/* Offers */}
                  <Box sx={{ display: 'flex', gap: 0.4, mb: 1, flexWrap: 'wrap' }}>
                    {store.offers.slice(0, 2).map((offer, idx) => (
                      <OfferChip
                        key={idx}
                        icon={offer.icon}
                        label={offer.text}
                        size="small"
                        sx={{ fontSize: '0.55rem', height: '20px' }}
                      />
                    ))}
                  </Box>
                  
              <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 1.5, lineHeight: 1.4, fontSize: '0.7rem' }}
                  >
                    {store.description.length > 80 ? store.description.substring(0, 80) + '...' : store.description}
                  </Typography>
                  
                  {/* Features */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4, mb: 2 }}>
                    {store.features.slice(0, 3).map((feature, idx) => (
                      <Chip
                        key={idx}
                        label={feature}
                        size="small"
                        sx={{
                          background: `${store.color}15`,
                          color: store.color,
                          fontWeight: 'medium',
                          border: `1px solid ${store.color}30`,
                          fontSize: '0.55rem',
                          height: '18px',
                          '&:hover': {
                            background: `${store.color}25`,
                          }
                        }}
                      />
                    ))}
                  </Box>
                  
                  {/* Action Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    size="small"
                    sx={{
                      background: `linear-gradient(45deg, ${store.color}, ${store.primaryColor})`,
                      color: 'white',
                      fontWeight: 'bold',
                      py: 0.6,
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      textTransform: 'none',
                      boxShadow: `0 3px 10px ${store.color}40`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${store.primaryColor}, ${store.color})`,
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${store.color}50`,
                      },
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    Explore {store.name} →
                  </Button>
                </CardContent>
              </StoreCard>
            </Box>
          ))}
        </Box>

        {/* Info Section */}
        <Paper 
          elevation={0} 
                sx={{ 
            mt: 8, 
            p: 6, 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1e293b', textAlign: 'center', mb: 4 }}>
            🎯 How Our Flyer System Works
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
              }}>
                <Typography variant="h4" sx={{ color: 'white' }}>🔄</Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                Live Updates
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Flyers are automatically updated every 6 hours from the official store websites, ensuring you always see the latest offers.
                    </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: 'linear-gradient(45deg, #f093fb, #f5576c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 8px 25px rgba(240, 147, 251, 0.3)'
              }}>
                <Typography variant="h4" sx={{ color: 'white' }}>⚡</Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                Fast Loading
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Intelligent caching system ensures quick loading while maintaining data freshness and optimal performance.
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 8px 25px rgba(79, 172, 254, 0.3)'
              }}>
                <Typography variant="h4" sx={{ color: 'white' }}>🛡️</Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                Reliable Service
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Multiple fallback layers ensure you always see content, even if updates fail or websites are temporarily unavailable.
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Footer Note */}
        <Box sx={{ textAlign: 'center', mt: 6, p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            💡 Pro Tip: Click on any store card to explore their latest flyers and exclusive offers!
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default FlyersPage;
