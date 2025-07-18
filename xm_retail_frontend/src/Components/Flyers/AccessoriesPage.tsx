import React, { useEffect, useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import { useNavigate } from "react-router-dom";
import Nav from '../NavBar/Nav';

interface AccessoryProduct {
  title: string;
  brand: string;
  year?: string;
  reference?: string;
  price: string;
  url: string;
  tags: string[];
  images: string[];
}

const AccessoriesPage: React.FC = () => {
  const [accessories, setAccessories] = useState<AccessoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/flyers/accessories")
      .then((res) => {
        const data = res.data;
        setAccessories(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

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
          Rolex Watches
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ textAlign: 'center', color: '#64748b', mb: 2 }}>
          Total Products: {accessories.length}
        </Typography>
        <Divider sx={{ mb: 4 }} />
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
              gap: 3,
              justifyContent: 'center',
              alignItems: 'stretch',
            }}
          >
            {accessories.map((item, idx) => (
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
                  image={item.images && item.images.length > 0 ? item.images[0] : ''}
                  alt={item.title}
                  sx={{ objectFit: 'cover', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>{item.brand}{item.year ? ` • ${item.year}` : ''}</Typography>
                  {item.reference && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>Ref: {item.reference}</Typography>
                  )}
                  <Typography variant="h6" sx={{ color: '#1976d2', mb: 1, textAlign: 'center' }}>{item.price}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1, justifyContent: 'center' }}>
                    {item.tags && item.tags.map((tag, i) => (
                      <Chip key={i} label={tag} size="small" color="primary" />
                    ))}
                  </Box>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    sx={{ mt: 1 }}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AccessoriesPage;
