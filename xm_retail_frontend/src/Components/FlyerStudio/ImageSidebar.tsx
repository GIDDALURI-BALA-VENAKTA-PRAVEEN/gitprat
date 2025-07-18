import React from 'react';
import { Box, IconButton, Typography, Button } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import FileUpload from '@mui/icons-material/FileUpload';
import ImageUploadPanel from './ImageUploadPanel';

interface ImageSidebarProps {
  openAssetPanel: string | null;
  setOpenAssetPanel: (panel: string | null) => void;
  uploadedImages: string[];
  setUploadedImages: React.Dispatch<React.SetStateAction<string[]>>;
  addImageToCanvas: (url: string) => void;
  setSnackbar: (snackbar: { open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }) => void;
}

const ImageSidebar: React.FC<ImageSidebarProps> = ({
  openAssetPanel,
  setOpenAssetPanel,
  uploadedImages,
  setUploadedImages,
  addImageToCanvas,
  setSnackbar,
}) => {
  if (openAssetPanel !== 'images') return null;
  return (
    <Box sx={{
      width: 320,
      height: '100%',
      background: '#fff',
      boxShadow: 4,
      borderRadius: '0 16px 16px 0',
      p: 0,
      position: 'relative',
      zIndex: 1200,
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
      ml: '-8px',
      borderLeft: 'none',
      borderTop: 'none',
      borderBottom: 'none',
      borderRight: '1px solid #eee',
      // Remove overflowY: 'auto' from here
    }}>
      {/* Collapse arrow */}
      <IconButton
        onClick={() => setOpenAssetPanel(null)}
        sx={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          m: 1,
          zIndex: 1300,
          background: '#fff',
          boxShadow: 2,
          borderRadius: '50%',
          border: '1px solid #eee',
          width: 40,
          height: 40,
          '&:hover': { background: '#f0f0f0' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChevronLeftIcon fontSize="large" />
      </IconButton>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 2, borderBottom: '1px solid #f0f0f0', background: '#fafbfc', borderRadius: '0 16px 0 0', position: 'sticky', top: 0, zIndex: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Images</Typography>
      </Box>
      {/* Scrollable content area below header and collapse button */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, minHeight: 0 }}>
        <ImageUploadPanel
          uploadedImages={uploadedImages}
          setUploadedImages={setUploadedImages}
          addImageToCanvas={addImageToCanvas}
          setSnackbar={setSnackbar}
        />
      </Box>
      {/* ... inside the slide-out asset panel Box, at the bottom ... */}
      <Box sx={{ mt: 'auto' }}>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={() => {
            setUploadedImages([]);
            setSnackbar({ open: true, message: 'All uploaded images cleared!', severity: 'info' });
          }}
          sx={{ mt: 2 }}
        >
          Clear Uploaded Images
        </Button>
      </Box>
    </Box>
  );
};

export default ImageSidebar; 