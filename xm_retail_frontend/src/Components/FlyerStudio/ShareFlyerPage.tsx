import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Snackbar, IconButton, Tooltip, TextField, Stack, Paper, useTheme } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import ShareDeviceIcon from '@mui/icons-material/ScreenShare';

interface ShareFlyerPageProps {
  flyer: any;
  studioToken: string | null;
  onSuccess: (url: string) => void;
  onError: (msg: string) => void;
  canvasSize: { width: number; height: number };
  stageRef: any;
}

const ShareFlyerPage: React.FC<ShareFlyerPageProps> = ({ flyer, studioToken, onSuccess, onError, canvasSize, stageRef }) => {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });
  const [copied, setCopied] = useState(false);
  const theme = useTheme();

  // Export flyer image as dataURL
  const exportFlyerImage = () => {
    if (!stageRef.current || typeof stageRef.current.toDataURL !== 'function') return null;
    const stage = stageRef.current;
    // Save current scale and position regarding if canvas is zoom in or zoom out
    const oldScaleX = stage.scaleX();
    const oldScaleY = stage.scaleY();
    const oldX = stage.x();
    const oldY = stage.y();
    // Reset to original
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    stage.batchDraw();
    // Export at original size
    const imageData = stage.toDataURL({
      width: canvasSize.width,
      height: canvasSize.height,
      pixelRatio: 2
    });
    // Restore previous scale and position
    stage.scale({ x: oldScaleX, y: oldScaleY });
    stage.position({ x: oldX, y: oldY });
    return imageData;
  };

  // Upload flyer and generate link on mount
  React.useEffect(() => {
    const handleShare = async () => {
      const imageData = exportFlyerImage();
      if (!imageData) {
        setSnackbar({ open: true, message: 'Unable to export flyer image.', severity: 'error' });
        onError('Unable to export flyer image.');
        return;
      }
      setLoading(true);
      try {
        // Convert dataURL to blob
        const response = await fetch(imageData);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append('flyer', blob, 'flyer.png');
        const res = await fetch('/api/studio-flyers/upload-flyer', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${studioToken}`,
          },
          body: formData,
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Upload failed with status ${res.status}`);
        }
        const data = await res.json();
        setShareUrl(data.url);
        setSnackbar({ open: true, message: 'Shareable link generated!', severity: 'success' });
        // Only call onSuccess when the user clicks “Done”.
      } catch (err: any) {
        setSnackbar({ open: true, message: err.message || 'Failed to upload flyer.', severity: 'error' });
        onError(err.message || 'Failed to upload flyer.');
      } finally {
        setLoading(false);
      }
    };
    handleShare();
    // eslint-disable-next-line
  }, []);

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setSnackbar({ open: true, message: 'Link copied to clipboard!', severity: 'success' });
    }
  };

  const handleSocialShare = (platform: 'whatsapp' | 'facebook' | 'twitter' | 'linkedin' | 'instagram') => {
    if (!shareUrl) return;
    let shareLink = '';
    const encoded = encodeURIComponent(shareUrl);
    if (platform === 'whatsapp') {
      shareLink = `https://wa.me/?text=${encoded}`;
    } else if (platform === 'facebook') {
      shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encoded}`;
    } else if (platform === 'twitter') {
      shareLink = `https://twitter.com/intent/tweet?url=${encoded}`;
    } else if (platform === 'linkedin') {
      shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`;
    } else if (platform === 'instagram') {
      // Instagram does not support direct web sharing, so open Instagram homepage
      shareLink = `https://www.instagram.com/`;
    }
    window.open(shareLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1300, // above most content, but below dialogs if any
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.08)', // optional: subtle overlay
      }}
    >
      {/* The shareable link box */}
      <Paper elevation={4} sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 3,
        minWidth: 320,
        maxWidth: 400,
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        boxShadow: 6,
      }}>
        {loading && (
          <Stack alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
            <CircularProgress color="primary" size={28} />
            <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontSize: 15 }}>Generating shareable link...</Typography>
          </Stack>
        )}
        {!loading && shareUrl && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1.2, textAlign: 'center', fontWeight: 700, color: theme.palette.primary.main, letterSpacing: 0.2, fontSize: 17 }}>
              Shareable Flyer Link
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.2, width: '100%' }}>
              <TextField
                value={shareUrl}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
                      <IconButton onClick={handleCopyLink} edge="end" size="small" sx={{ ml: 0.5 }}>
                        <ContentCopyIcon fontSize="small" color={copied ? 'success' : 'action'} />
                      </IconButton>
                    </Tooltip>
                  ),
                  sx: { fontWeight: 500, letterSpacing: 0.1, background: '#f7fafd', borderRadius: 1.5, fontSize: 13 },
                }}
                fullWidth
                size="small"
                sx={{ mr: 0.5, fontSize: 13 }}
              />
            </Box>
            <Stack direction="row" spacing={1.2} sx={{ mb: 1.2, justifyContent: 'center', width: '100%' }}>
              <Tooltip title="Share on WhatsApp">
                <IconButton color="success" size="small" onClick={() => handleSocialShare('whatsapp')} sx={{ bgcolor: '#e8f5e9', '&:hover': { bgcolor: '#c8e6c9' } }}>
                  <WhatsAppIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share on Facebook">
                <IconButton color="primary" size="small" onClick={() => handleSocialShare('facebook')} sx={{ bgcolor: '#e3f2fd', '&:hover': { bgcolor: '#bbdefb' } }}>
                  <FacebookIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share on Twitter">
                <IconButton color="info" size="small" onClick={() => handleSocialShare('twitter')} sx={{ bgcolor: '#e1f5fe', '&:hover': { bgcolor: '#b3e5fc' } }}>
                  <TwitterIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share on LinkedIn">
                <IconButton color="primary" size="small" onClick={() => handleSocialShare('linkedin')} sx={{ bgcolor: '#e8eaf6', '&:hover': { bgcolor: '#c5cae9' } }}>
                  <LinkedInIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share on Instagram (opens Instagram)">
                <IconButton color="secondary" size="small" onClick={() => handleSocialShare('instagram')} sx={{ bgcolor: '#fce4ec', '&:hover': { bgcolor: '#f8bbd0' } }}>
                  <InstagramIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            <Button variant="contained" size="small" onClick={onSuccess ? () => onSuccess(shareUrl) : undefined} sx={{ mt: 1, borderRadius: 1.5, fontWeight: 600, fontSize: 14, boxShadow: 1, minWidth: 80 }}>
              Done
            </Button>
          </>
        )}
      </Paper>
      {/* Snackbar remains as is */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Box sx={{ color: snackbar.severity === 'error' ? 'red' : snackbar.severity === 'success' ? 'green' : 'black', p: 1 }}>{snackbar.message}</Box>
      </Snackbar>
    </Box>
  );
};

export default ShareFlyerPage; 