import React, { useEffect, useState } from 'react';
import { useLocationPermission } from '../LocationPermission/useLocationPermission';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SwiggyBanners: React.FC = () => {
  const { locationState } = useLocationPermission();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  // More diverse and reliable fallback images
  const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1504674900240-9a9049b7d8ce?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&crop=center',
    // Add more food-related fallback images
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center'
  ];

  // Function to determine city based on coordinates (same logic as backend)
  const getCityFromCoordinates = (lat: number, lng: number): string => {
    // Bengaluru coordinates (approximate)
    if (lat >= 12.8 && lat <= 13.2 && lng >= 77.4 && lng <= 77.8) {
      return 'Bengaluru';
    }
    // Mumbai coordinates (approximate)
    else if (lat >= 18.8 && lat <= 19.2 && lng >= 72.7 && lng <= 73.1) {
      return 'Mumbai';
    }
    // Delhi coordinates (approximate)
    else if (lat >= 28.4 && lat <= 28.9 && lng >= 76.8 && lng <= 77.4) {
      return 'Delhi';
    }
    // Hyderabad coordinates (approximate)
    else if (lat >= 17.2 && lat <= 17.6 && lng >= 78.2 && lng <= 78.6) {
      return 'Hyderabad';
    }
    // Chennai coordinates (approximate)
    else if (lat >= 12.9 && lat <= 13.2 && lng >= 80.1 && lng <= 80.4) {
      return 'Chennai';
    }
    // Kolkata coordinates (approximate)
    else if (lat >= 22.4 && lat <= 22.8 && lng >= 88.2 && lng <= 88.6) {
      return 'Kolkata';
    }
    
    return locationState.city || 'your area';
  };

  // Function to check if an image exists
  const checkImageExists = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      // Timeout after 3 seconds
      setTimeout(() => resolve(false), 3000);
    });
  };

  // Function to construct proper Swiggy image URLs
  const constructSwiggyImageUrl = (imageId: string): string => {
    if (!imageId) return '';
    
    // If it's already a full URL, return as is
    if (imageId.startsWith('http')) {
      return imageId;
    }
    
    // If it's a complex path with slashes, encode it properly
    if (imageId.includes('/')) {
      // Encode the path for Cloudinary
      const encodedId = encodeURIComponent(imageId);
      return `https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_400,h_300/${encodedId}`;
    }
    
    // For simple IDs, use the standard format
    return `https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_400,h_300/${imageId}`;
  };

  useEffect(() => {
    if (locationState.latitude && locationState.longitude) {
      setLoading(true);
      fetch(`/api/flyers/swiggy-restaurants?lat=${locationState.latitude}&lng=${locationState.longitude}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.swiggy.com/',
          'Origin': 'https://www.swiggy.com'
        }
      })
        .then(async res => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text);
          }
          return res.json();
        })
        .then(async (data) => {
          if (data.error) throw new Error(data.error + (data.details ? ': ' + data.details : ''));
          
          // Process banners and validate images
          const processedBanners = await Promise.all(
            (data.banners || []).map(async (banner: any, index: number) => {
              const fallbackImageUrl = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
              
              // Check if the original image exists
              const imageExists = await checkImageExists(banner.imageUrl);
              
              return {
                ...banner,
                fallbackImageUrl,
                // If image doesn't exist, mark it as failed immediately
                imageFailed: !imageExists
              };
            })
          );
          
          setBanners(processedBanners);
        })
        .catch(err => {
          setBanners([]);
          console.error('Failed to load Swiggy banners:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [locationState.latitude, locationState.longitude]);

  const handleImageError = (imageUrl: string) => {
    setImageErrors(prev => new Set(prev).add(imageUrl));
  };

  const getImageUrl = (banner: any) => {
    // If the original image failed to load or was pre-validated as failed, use fallback
    if (banner.imageFailed || imageErrors.has(banner.imageUrl)) {
      return banner.fallbackImageUrl || FALLBACK_IMAGES[0];
    }
    return banner.imageUrl;
  };

  // Get the correct city name based on coordinates
  const currentCity = locationState.latitude && locationState.longitude 
    ? getCityFromCoordinates(locationState.latitude, locationState.longitude)
    : 'your area';

  if (!locationState.latitude || !locationState.longitude) return <div>Detecting location...</div>;
  if (loading) return <div>Loading Swiggy banners...</div>;
  if (!banners.length) return <div>No banners found for your location.</div>;

  return (
    <div style={{ padding: 24 }}>
      <Button variant="outlined" onClick={() => navigate(-1)} style={{ marginBottom: 24, fontWeight: 'bold', fontSize: '1rem', borderRadius: 8, borderColor: '#ff9800', color: '#ff9800' }}>
        ← Back to Flyers
      </Button>
      <h2>Swiggy Posters in {currentCity}</h2>
      <div style={{ 
        background: '#fff3cd', 
        border: '1px solid #ffeaa7', 
        borderRadius: 8, 
        padding: 12, 
        marginBottom: 16,
        fontSize: '14px',
        color: '#856404'
      }}>
        <strong>Note:</strong> We're showing relevant food images as placeholders since Swiggy's original images are not accessible.
      </div>
      
      {/* Enhanced Poster Grid Container */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)', // 6 columns for smaller images
        gap: '2px', // Small gap for definition
        padding: '8px',
        maxWidth: '800px', // Limit maximum width
        margin: '0 auto',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 12px 32px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1)',
        background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
        border: '1px solid #dee2e6'
      }}>
        {banners.map((b, idx) => (
          <div key={b.id || idx} style={{ 
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            width: '100%',
            height: '120px', // Fixed smaller height
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 8,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
            e.currentTarget.style.zIndex = '10';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            e.currentTarget.style.zIndex = '1';
          }}
          >
            <a href={b.link} target='_blank' rel='noopener noreferrer' style={{ 
              textDecoration: 'none', 
              color: 'inherit', 
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              position: 'relative'
            }}>
              {/* Image Container */}
              <div style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '8px 8px 0 0'
              }}>
                <img 
                  src={getImageUrl(b)} 
                  alt={b.altText || b.name} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    display: 'block',
                    transition: 'transform 0.3s ease'
                  }}
                  onError={() => handleImageError(b.imageUrl)}
                  loading="lazy"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
                
                {/* Subtle overlay for better text readability */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '30px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.4))',
                  pointerEvents: 'none'
                }} />
              </div>
              
              {/* Name Container - Compact */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(0,0,0,0.8)',
                padding: '6px 4px',
                color: 'white',
                minHeight: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0 0 8px 8px'
              }}>
                <div style={{ 
                  fontWeight: '600', 
                  fontSize: '9px',
                  textAlign: 'center',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%',
                  lineHeight: '1.1',
                  letterSpacing: '0.2px'
                }}>
                  {b.name}
                </div>
              </div>
              
              {/* Fallback indicator - minimal */}
              {(b.isFallback || b.imageFailed || imageErrors.has(b.imageUrl)) && (
                <div style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  background: 'rgba(255, 152, 0, 0.9)',
                  color: 'white',
                  fontSize: '6px',
                  padding: '1px 3px',
                  borderRadius: '2px',
                  zIndex: 2,
                  fontWeight: 'bold',
                  backdropFilter: 'blur(2px)'
                }}>
                  {b.isFallback ? 'S' : 'F'}
                </div>
              )}
              
              {/* Hover effect overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255, 152, 0, 0.1)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                borderRadius: 8,
                pointerEvents: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0';
              }}
              />
            </a>
          </div>
        ))}
      </div>
      
      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          marginTop: 20,
          padding: 16,
          background: '#f5f5f5',
          borderRadius: 8,
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <strong>Debug Info:</strong>
          <br />
          Total Images: {banners.length}
          <br />
          Failed Images: {Array.from(imageErrors).length}
          <br />
          Pre-failed: {banners.filter(b => b.imageFailed).length}
        </div>
      )}
    </div>
  );
};

export default SwiggyBanners; 