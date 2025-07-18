import React, { useEffect, useState } from 'react';
import Nav from '../NavBar/Nav';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const fadeInKeyframes = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
`;

const SarathCityFlyersPage: React.FC = () => {
  const [flyers, setFlyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlyers = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:4000/api/flyers/sarathcity");
        const data = await response.json();
        if (data.success) {
          setFlyers(data.data || []);
        } else {
          setError('Failed to fetch Sarath City flyers');
        }
      } catch (err) {
        setError('Failed to load Sarath City flyers');
      } finally {
        setLoading(false);
      }
    };
    fetchFlyers();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>;

  return (
    <>
    <Nav />
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 16px' }}>
      <Button variant="outlined" onClick={() => navigate(-1)} style={{ marginBottom: 24, fontWeight: 'bold', fontSize: '1rem', borderRadius: 8, borderColor: '#3b3b3b', color: '#3b3b3b' }}>
         Back to Flyers
      </Button>
      <style>{fadeInKeyframes}</style>
      <h1 style={{
        textAlign: 'center',
        fontSize: '2.5rem',
        fontWeight: 700,
        marginBottom: '32px',
        letterSpacing: '0.02em',
        color: '#3b3b3b',
        textShadow: '0 2px 8px rgba(0,0,0,0.06)',
        animation: 'fadeInUp 0.8s cubic-bezier(.4,1.4,.6,1)'
      }}>
      
        Sarath City Capital Mall - Offers
      </h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
        gap: '36px',
        justifyItems: 'center',
      }}>
        {flyers.map((flyer, idx) => (
          <img
            key={idx}
            src={flyer.url}
            alt={flyer.title || `Sarath City Banner ${idx + 1}`}
            style={{
              width: '100%',
              maxWidth: 900,
              height: 'auto',
              borderRadius: 18,
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
              objectFit: 'cover',
              background: '#f3f3f3',
              transition: 'transform 0.3s, box-shadow 0.3s',
              cursor: 'pointer',
              animation: `fadeInUp 0.7s ${0.1 + idx * 0.08}s both`,
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.025)';
              (e.currentTarget as HTMLImageElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.16)';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLImageElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.10)';
            }}
          />
        ))}
      </div>
    </div>
    </>
    );
};

export default SarathCityFlyersPage; 