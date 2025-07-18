import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';

interface SaveFlyerPageProps {
  flyer: any;
  studioToken: string | null;
  onSuccess: () => void;
  onError: (msg: string) => void;
  canvasSize: { width: number; height: number };
  stageRef: any;
}

const SaveFlyerPage: React.FC<SaveFlyerPageProps> = ({ flyer, studioToken, onSuccess, onError, canvasSize, stageRef }) => {
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'info' });

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
      pixelRatio: 2
    });
    stage.scale({ x: oldScaleX, y: oldScaleY });
    stage.position({ x: oldX, y: oldY });
    return imageData;
  };

  useEffect(() => {
    const save = async () => {
      setSnackbar({ open: true, message: 'Saving...', severity: 'info' });
      const imageData = exportFlyerImage();
      if (!imageData) {
        setLoading(false);
        setSnackbar({ open: true, message: 'Unable to export flyer image.', severity: 'error' });
        onError && onError('Unable to export flyer image.');
        return;
      }
      try {
        const saveRes = await fetch('/api/studio-flyers/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${studioToken}`,
          },
          body: JSON.stringify({
            title: 'My Flyer',
            flyerData: flyer,
            imageData,
          }),
        });
        const saveData = await saveRes.json();
        if (!saveRes.ok) throw new Error(saveData.message || 'Failed to save flyer');
        setSnackbar({ open: true, message: 'Saved successfully!', severity: 'success' });
        setTimeout(() => {
          onSuccess && onSuccess();
        }, 1500);
      } catch (err: any) {
        setSnackbar({ open: true, message: err.message || 'Failed to save flyer', severity: 'error' });
        onError && onError(err.message || 'Failed to save flyer');
      } finally {
        setLoading(false);
      }
    };
    save();
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Snackbar
        open={snackbar.open || loading}
        autoHideDuration={snackbar.severity === 'info' ? null : 4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={loading ? 'info' : snackbar.severity as 'success' | 'error'} sx={{ width: '100%' }}>
          {loading ? 'Saving...' : snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SaveFlyerPage; 