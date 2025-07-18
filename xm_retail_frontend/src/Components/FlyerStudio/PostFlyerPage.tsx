import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';

interface PostFlyerPageProps {
  flyer: any;
  profile: any;
  onSuccess: () => void;
  onError: (msg: string) => void;
  canvasSize: { width: number; height: number };
  stageRef: any;
}

const PostFlyerPage: React.FC<PostFlyerPageProps> = ({
  flyer,
  profile,
  onSuccess,
  onError,
  canvasSize,
  stageRef,
}) => {
  console.log('PostFlyerPage mounted');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'info' });
  const focusTrapRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusTrapRef.current) {
      focusTrapRef.current.focus();
    }
  }, []);

  useEffect(() => {
    console.log('Starting post process');
    const post = async () => {
      setSnackbar({ open: true, message: 'Posting...', severity: 'info' });
      console.log('Flyer:', flyer);
      console.log('Profile:', profile);
      if (!profile) {
        setLoading(false);
        setSnackbar({ open: true, message: 'Login required to post flyer.', severity: 'error' });
        onError && onError('Login required to post flyer.');
        console.log('No profile, aborting post');
        return;
      }
      const exportFlyerImage = () => {
        if (!stageRef.current || typeof stageRef.current.toDataURL !== 'function') return null;
        const stage = stageRef.current;
        const oldScaleX = stage.scaleX();
        const oldScaleY = stage.scaleY();
        const oldX = stage.x();
        const oldY = stage.y();
        stage.scale({ x: 1, y: 1 });
        stage.position({ x: 0, y: 0 });
        stage.batchDraw();
        const imageData = stage.toDataURL({
          width: canvasSize.width,
          height: canvasSize.height,
          pixelRatio: 2,
        });
        stage.scale({ x: oldScaleX, y: oldScaleY });
        stage.position({ x: oldX, y: oldY });
        return imageData;
      };
      const imageData = exportFlyerImage();
      console.log('Exported imageData:', imageData ? imageData.substring(0, 100) + '...' : null);
      if (!imageData) {
        setLoading(false);
        setSnackbar({ open: true, message: 'Unable to export flyer image.', severity: 'error' });
        onError && onError('Unable to export flyer image.');
        console.log('No imageData, aborting post');
        return;
      }
      try {
        const res = await fetch('/api/posted-flyers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: profile.firstName || profile.name || '',
            email: profile.email || '',
            number: profile.phone || '',
            title: 'My Flyer',
            flyerData: flyer,
            imageData,
          }),
        });
        const data = await res.json();
        console.log('Backend response:', data);
        if (!res.ok) throw new Error(data.message || 'Failed to post flyer');
        setSnackbar({ open: true, message: 'Posted successfully!', severity: 'success' });
        console.log('Posted successfully!');
        setTimeout(() => {
          onSuccess && onSuccess();
        }, 1500);
      } catch (err: any) {
        setSnackbar({ open: true, message: err.message || 'Failed to post flyer', severity: 'error' });
        onError && onError(err.message || 'Failed to post flyer');
        console.error('Error posting flyer:', err);
      } finally {
        setLoading(false);
      }
    };
    post();
    // eslint-disable-next-line
  }, []);

  return (
    <div
      tabIndex={-1}
      style={{
        outline: 'none',
        minWidth: 320,
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Hidden focus trap for accessibility */}
      <div
        ref={focusTrapRef}
        tabIndex={0}
        autoFocus
        style={{ width: 0, height: 0, overflow: 'hidden', position: 'absolute' }}
      />
      <Snackbar
        open={snackbar.open || loading}
        autoHideDuration={snackbar.severity === 'info' ? null : 4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={loading ? 'info' : snackbar.severity} sx={{ width: '100%' }}>
          {loading ? 'Posting...' : snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PostFlyerPage; 