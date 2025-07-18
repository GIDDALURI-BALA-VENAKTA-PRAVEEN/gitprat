import React from 'react';
import { Box, Button, Typography, TextField } from '@mui/material';
import FileUpload from '@mui/icons-material/FileUpload';

interface ImageUploadPanelProps {
  uploadedImages: string[];
  setUploadedImages: React.Dispatch<React.SetStateAction<string[]>>;
  addImageToCanvas: (url: string) => void;
  setSnackbar: (snackbar: { open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }) => void;
}

const ImageUploadPanel: React.FC<ImageUploadPanelProps> = ({ uploadedImages, setUploadedImages, addImageToCanvas, setSnackbar }) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    let successCount = 0;
    let errorCount = 0;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        setSnackbar({ open: true, message: 'Only image files are allowed.', severity: 'error' });
        errorCount++;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({ open: true, message: 'Image is too large. Please upload images < 5MB.', severity: 'error' });
        errorCount++;
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target && typeof ev.target.result === 'string') {
          setUploadedImages(prev => [...prev, ev.target!.result as string]);
          successCount++;
          if (successCount === files.length - errorCount) {
            setSnackbar({ open: true, message: `Successfully uploaded ${successCount} image${successCount > 1 ? 's' : ''}!`, severity: 'success' });
          }
        }
      };
      reader.onerror = () => {
        errorCount++;
        setSnackbar({ open: true, message: `Failed to read file: ${file.name}`, severity: 'error' });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  return (
    <Box>
      <TextField size="small" placeholder="Search images..." fullWidth sx={{ mb: 2 }} InputProps={{ style: { borderRadius: 8, background: '#f7f7f7' } }} />
      <Button variant="contained" component="label" startIcon={<FileUpload />} fullWidth sx={{ mb: 2, borderRadius: 2, fontWeight: 600 }}>
        Upload
        <input type="file" accept="image/*" multiple hidden onChange={handleImageUpload} />
      </Button>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, p: 0.5, borderRadius: 2, background: '#fafbfc' }}>
        {uploadedImages.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ gridColumn: '1 / -1', textAlign: 'center', mt: 2 }}>
            No images uploaded yet.
          </Typography>
        )}
        {uploadedImages.map((img, idx) => (
          <Box
            key={idx}
            sx={{
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: 1,
              cursor: 'pointer',
              border: '2px solid transparent',
              transition: 'border 0.2s, box-shadow 0.2s',
              '&:hover': {
                border: '2px solid #1976d2',
                boxShadow: 3,
              },
            }}
            onClick={() => addImageToCanvas(img)}
          >
            <img
              src={img}
              alt="uploaded"
              style={{ width: '100%', height: 60, objectFit: 'cover', display: 'block' }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ImageUploadPanel; 