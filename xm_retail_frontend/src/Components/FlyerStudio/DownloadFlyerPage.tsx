import React, { useEffect, useState, useRef } from 'react';
import { Snackbar, Alert } from '@mui/material';

interface DownloadFlyerPageProps {
  flyer: any;
  canvasSize: { width: number; height: number };
  stageRef: any;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

const DownloadFlyerPage: React.FC<DownloadFlyerPageProps> = ({ flyer, canvasSize, stageRef, onSuccess, onError }) => {
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'successs' | 'error' }>({ open: false, message: '', severity: 'success' });
  const hasDownloaded = useRef(false);

  useEffect(() => {
    if (hasDownloaded.current) return;
    hasDownloaded.current = true;
    const exportFlyerImage = () => {
      if (!stageRef.current || typeof stageRef.current.toDataURL !== 'function') return null;
      const stage = stageRef.current;
      // Save current scale and position
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
    try {
      const uri = exportFlyerImage();
      if (!uri) throw new Error('Unable to export flyer image.');
      const link = document.createElement('a');
      link.download = 'flyer.png';
      link.href = uri;
      link.click();
      setSnackbar({ open: true, message: 'Flyer downloaded!', severity: 'success' });
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 1000);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to download flyer.', severity: 'error' });
      setTimeout(() => {
        onError && onError(err.message || 'Failed to download flyer.');
      }, 1000);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={1000}
      onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
    </Snackbar>
  );
};

export default DownloadFlyerPage; 