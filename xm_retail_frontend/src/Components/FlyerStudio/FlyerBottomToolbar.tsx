import React from 'react';
import { Box, Typography, IconButton, Slider, Divider, Tooltip, Select, MenuItem, TextField } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const CANVAS_PRESETS = [
  { label: 'Default (350x500)', width: 350, height: 500 },
  { label: 'Instagram (1080x1080)', width: 1080, height: 1080 },
  { label: 'Facebook Cover (820x312)', width: 820, height: 312 },
  { label: 'A4 (794x1123)', width: 794, height: 1123 },
  { label: 'Custom', width: 0, height: 0 },
];

interface FlyerBottomToolbarProps {
  zoom: number;
  onZoomChange: (z: number) => void;
  setPreviewOpen: (open: boolean) => void;
  canvasPreset: string;
  setCanvasPreset: (preset: string) => void;
  customSize: { width: number; height: number };
  setCustomSize: (size: { width: number; height: number }) => void;
  onSizeChange: (w: number, h: number) => void;
}

const FlyerBottomToolbar: React.FC<FlyerBottomToolbarProps> = ({
  zoom,
  onZoomChange,
  setPreviewOpen,
  canvasPreset,
  setCanvasPreset,
  customSize,
  setCustomSize,
  onSizeChange,
}) => {
  return (
    <Box sx={{
      position: 'fixed',
      bottom: 18,
      right: 10,
      zIndex: 1300,
      bgcolor: '#fff',
      boxShadow: '0px 2px 16px 0px rgba(0,0,0,0.12)',
      border: '1px solid #eee',
      borderRadius: 3,
      px: 2,
      py: 1,
      minWidth: 420,
      maxWidth: '90vw',
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
    }}>
      {/* Size select */}
      <Typography variant="body2" sx={{ fontWeight: 500, color: '#555' }}>Size:</Typography>
      <Select
        size="small"
        value={canvasPreset}
        onChange={e => {
          setCanvasPreset(e.target.value);
          const preset = CANVAS_PRESETS.find(p => p.label === e.target.value);
          if (preset && preset.label !== 'Custom') {
            onSizeChange(preset.width, preset.height);
            setCustomSize({ width: preset.width, height: preset.height });
          }
        }}
        sx={{ minWidth: 120, borderRadius: 2, bgcolor: '#f7f7f7', fontWeight: 500 }}
      >
        {CANVAS_PRESETS.map(p => (
          <MenuItem key={p.label} value={p.label}>{p.label}</MenuItem>
        ))}
      </Select>
      {canvasPreset === 'Custom' && (
        <>
          <TextField
            label="Width"
            type="number"
            size="small"
            value={customSize.width}
            onChange={e => {
              const w = Math.max(50, Number(e.target.value));
              setCustomSize({ width: w, height: customSize.height });
              onSizeChange(w, customSize.height);
            }}
            sx={{ width: 70, mx: 0.5, background: '#f7f7f7', borderRadius: 2 }}
            inputProps={{ min: 50 }}
          />
          <TextField
            label="Height"
            type="number"
            size="small"
            value={customSize.height}
            onChange={e => {
              const h = Math.max(50, Number(e.target.value));
              setCustomSize({ width: customSize.width, height: h });
              onSizeChange(customSize.width, h);
            }}
            sx={{ width: 70, background: '#f7f7f7', borderRadius: 2 }}
            inputProps={{ min: 50 }}
          />
        </>
      )}
      {/* Divider */}
      <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 28 }} />
      {/* Zoom slider */}
      <IconButton onClick={() => onZoomChange(Math.max(zoom - 0.1, 0.2))} sx={{ color: '#1976d2', p: 0.5 }}><ZoomOutIcon /></IconButton>
      <Slider
        value={zoom}
        min={0.2}
        max={2}
        step={0.01}
        onChange={(_, v) => onZoomChange(Number(v))}
        sx={{ width: 110, mx: 1 }}
      />
      <IconButton onClick={() => onZoomChange(Math.min(zoom + 0.1, 2))} sx={{ color: '#1976d2', p: 0.5 }}><ZoomInIcon /></IconButton>
      <Typography variant="body2" sx={{ minWidth: 36, textAlign: 'center', color: '#222', fontWeight: 600 }}>{Math.round(zoom * 100)}%</Typography>
      {/* Full size/preview */}
      <Tooltip title="Preview">
        <IconButton sx={{ color: '#1976d2', p: 0.5, ml: 1 }} onClick={() => setPreviewOpen(true)}>
          <OpenInFullIcon />
        </IconButton>
      </Tooltip>
     
    </Box>
  );
};

export default FlyerBottomToolbar;