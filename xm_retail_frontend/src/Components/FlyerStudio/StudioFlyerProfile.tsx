import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Avatar, CircularProgress, Alert, TextField, Button, Snackbar, IconButton, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

export default function StudioFlyerProfile({ token }: { token: string }) {
  const [profile, setProfile] = useState<any>(null);
  const [editProfile, setEditProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [flyers, setFlyers] = useState<any[]>([]);
  const [postedFlyers, setPostedFlyers] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Session expired. Please login again.');
      setTimeout(() => { window.location.href = '/studio/login'; }, 1500);
      return;
    }
    setLoading(true);
    axios.get('/api/studio-users/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setProfile(res.data); setEditProfile(res.data); setLoading(false); })
      .catch(err => {
        setLoading(false);
        if (err.response && (err.response.status === 401 || err.response.status === 404)) {
          setError('Session expired or user not found. Please login again.');
          setTimeout(() => { window.location.href = '/studio/login'; }, 1500);
        } else {
          setError('Failed to load profile');
        }
      });

    // Fetch saved flyers
    if (token) {
      axios.get('/api/studio-flyers', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          let flyers = res.data.flyers || [];
          // Sort by createdAt descending (latest first on the left), fallback to id
          flyers = flyers.sort((a: any, b: any) => {
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return (b.id || 0) - (a.id || 0);
          });
          setFlyers(flyers);
        })
        .catch(() => setFlyers([]));
    }

    // Fetch posted flyers (logic same as FlyersPage)
    fetch('/api/posted-flyers')
      .then(res => res.json())
      .then((data) => {
        let flyers = Array.isArray(data) ? data : (data.flyers || []);
        flyers = flyers.sort((a: any, b: any) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return (b.id || 0) - (a.id || 0);
        });
        setPostedFlyers(flyers);
      })
      .catch(() => setPostedFlyers([]));
  }, [token]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => { setIsEditing(false); setEditProfile(profile); };
  const handleChange = (field: string, value: string) => setEditProfile((p: any) => ({ ...p, [field]: value }));
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.patch('/api/studio-users/profile', {
        firstName: editProfile.firstName,
        lastName: editProfile.lastName,
        phone: editProfile.phone,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(res.data);
      setEditProfile(res.data);
      setIsEditing(false);
      setSnackbar({ open: true, message: 'Profile updated!', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to update profile', severity: 'error' });
    }
    setLoading(false);
  };
  const handleLogout = () => {
    localStorage.removeItem('studioToken');
    window.location.href = '/studio/login';
  };

  if (error) return <Alert severity="error">{error}</Alert>;
  if (loading || !editProfile) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><CircularProgress /></Box>;
  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', position: 'relative', overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', pt: 8 }}>
      {/* Glassy Back Button */}
      <IconButton onClick={() => navigate('/studio')} sx={{ position: 'fixed', top: 32, left: 32, zIndex: 10, background: 'rgba(255,255,255,0.5)', boxShadow: 3, backdropFilter: 'blur(8px)', border: '1.5px solid #fff', width: 48, height: 48, '&:hover': { background: 'rgba(255,255,255,0.7)' } }}>
        <ArrowBackIcon fontSize="medium" />
      </IconButton>
      {/* Glassmorphism Card */}
      <Paper elevation={8} sx={{
        maxWidth: 420,
        width: '100%',
        borderRadius: 6,
        px: { xs: 2, sm: 6 },
        py: { xs: 4, sm: 6 },
        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(18px)',
        border: '1.5px solid rgba(255,255,255,0.35)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4,
      }}>
        {/* Avatar with Accent Ring */}
        <Box sx={{
          mb: 3,
          mt: -8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Box sx={{
            p: 1.2,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
            boxShadow: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Avatar sx={{ width: 100, height: 100, fontSize: 40, bgcolor: '#6366f1', boxShadow: 2 }}>
              {editProfile.firstName?.[0] || editProfile.email?.[0] || editProfile.phone?.[0] || '?'}
            </Avatar>
          </Box>
        </Box>
        {/* Name and Email/Phone */}
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#222', mb: 0.5, letterSpacing: 0.5, textAlign: 'center' }}>{editProfile.firstName} {editProfile.lastName}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: 17, mb: 2, textAlign: 'center' }}>{editProfile.email || editProfile.phone}</Typography>
        {/* Profile Fields */}
        <Box sx={{ width: '100%', mb: 3 }}>
          <TextField
            label="First Name"
            value={editProfile.firstName || ''}
            onChange={e => handleChange('firstName', e.target.value)}
            fullWidth
            margin="normal"
            disabled={!isEditing}
            sx={{ mb: 2, background: 'rgba(255,255,255,0.7)', borderRadius: 2, fontSize: 18, boxShadow: isEditing ? 2 : 0, transition: 'box-shadow 0.2s' }}
            InputProps={{ style: { fontSize: 18, borderRadius: 12 } }}
            InputLabelProps={{ style: { fontSize: 16 } }}
          />
          <TextField
            label="Last Name"
            value={editProfile.lastName || ''}
            onChange={e => handleChange('lastName', e.target.value)}
            fullWidth
            margin="normal"
            disabled={!isEditing}
            sx={{ mb: 2, background: 'rgba(255,255,255,0.7)', borderRadius: 2, fontSize: 18, boxShadow: isEditing ? 2 : 0, transition: 'box-shadow 0.2s' }}
            InputProps={{ style: { fontSize: 18, borderRadius: 12 } }}
            InputLabelProps={{ style: { fontSize: 16 } }}
          />
          <TextField
            label="Phone"
            value={editProfile.phone || ''}
            onChange={e => handleChange('phone', e.target.value)}
            fullWidth
            margin="normal"
            disabled={!isEditing}
            sx={{ mb: 2, background: 'rgba(255,255,255,0.7)', borderRadius: 2, fontSize: 18, boxShadow: isEditing ? 2 : 0, transition: 'box-shadow 0.2s' }}
            InputProps={{ style: { fontSize: 18, borderRadius: 12 } }}
            InputLabelProps={{ style: { fontSize: 16 } }}
          />
          <TextField
            label="Email"
            value={editProfile.email || ''}
            fullWidth
            margin="normal"
            disabled
            sx={{ mb: 2, background: 'rgba(255,255,255,0.7)', borderRadius: 2, fontSize: 18 }}
            InputProps={{ style: { fontSize: 18, borderRadius: 12 } }}
            InputLabelProps={{ style: { fontSize: 16 } }}
          />
        </Box>
        {/* Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 1, justifyContent: 'center', width: '100%' }}>
          {isEditing ? (
            <>
              <Button variant="contained" color="primary" onClick={handleSave} disabled={loading} sx={{ borderRadius: 3, px: 4, py: 1.2, fontWeight: 600, fontSize: 17, boxShadow: 2, textTransform: 'none' }}>Save</Button>
              <Button variant="outlined" onClick={handleCancel} disabled={loading} sx={{ borderRadius: 3, px: 4, py: 1.2, fontWeight: 600, fontSize: 17, textTransform: 'none' }}>Cancel</Button>
            </>
          ) : (
            <Button variant="contained" onClick={handleEdit} sx={{ borderRadius: 3, px: 4, py: 1.2, fontWeight: 600, fontSize: 17, boxShadow: 2, textTransform: 'none' }}>Edit Profile</Button>
          )}
          <Button variant="outlined" color="error" onClick={handleLogout} sx={{ borderRadius: 3, px: 4, py: 1.2, fontWeight: 600, fontSize: 17, textTransform: 'none' }}>Logout</Button>
        </Box>
        <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity={snackbar.severity as any} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Paper>
      {/* Saved Flyers Section OUTSIDE the card */}
      <Box sx={{ width: '100%', maxWidth: 1200, mt: 5, px: { xs: 1, sm: 4 }, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#6366f1', letterSpacing: 0.5, textAlign: 'left' }}>Saved Flyers</Typography>
        {flyers.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'left' }}>No flyers saved yet.</Typography>
        ) : (
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            overflowX: 'auto',
            py: 1,
            px: 0.5,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.25)',
            boxShadow: 1,
            alignItems: 'center',
          }}>
            {flyers.map(flyer => (
              <Box key={flyer.id} sx={{ minWidth: 120, minHeight: 120, maxWidth: 160, maxHeight: 160, borderRadius: 3, overflow: 'hidden', boxShadow: 2, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={flyer.previewImageUrl} alt="Flyer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
            ))}
          </Box>
        )}
      </Box>
      {/* Posted Flyers Section OUTSIDE the card */}
      <Box sx={{ width: '100%', maxWidth: 1200, mb: 4, px: { xs: 1, sm: 4 } }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#ff6b35', letterSpacing: 0.5, textAlign: 'left' }}>Posted Flyers</Typography>
        {postedFlyers.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'left' }}>No flyers posted yet.</Typography>
        ) : (
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            overflowX: 'auto',
            py: 1,
            px: 0.5,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.25)',
            boxShadow: 1,
            alignItems: 'center',
          }}>
            {postedFlyers.map(flyer => (
              <Box key={flyer.id} sx={{ minWidth: 120, minHeight: 120, maxWidth: 160, maxHeight: 160, borderRadius: 3, overflow: 'hidden', boxShadow: 2, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={flyer.previewImageUrl} alt="Posted Flyer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
} 