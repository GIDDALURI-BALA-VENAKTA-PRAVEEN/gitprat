import React, { useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import Crop from '@mui/icons-material/Crop';
import Flip from '@mui/icons-material/Flip';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Layers from '@mui/icons-material/Layers';
import Lock from '@mui/icons-material/Lock';
import LockOpen from '@mui/icons-material/LockOpen';
import Restore from '@mui/icons-material/Restore';
//sushma
interface ImageToolbarProps {
  isLocked: boolean;
  onCrop: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onLockToggle: () => void;
  onResetSize: () => void;
  cropMode: boolean;
  style?: React.CSSProperties;
}

const ImageToolbar: React.FC<ImageToolbarProps> = ({
  isLocked,
  onCrop,
  onFlipHorizontal,
  onFlipVertical,
  onEdit,
  onDelete,
  onBringForward,
  onSendBackward,
  onLockToggle,
  onResetSize,
  cropMode,
  style,
}) => {
  const [active, setActive] = useState<string | null>(null);

  // Helper to handle click and set active
  const handleClick = (name: string, callback: () => void) => {
    setActive(name);
    callback();
    setTimeout(() => setActive(null), 200); // Remove highlight after 200ms
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: 2000,
        background: '#fff',
        borderRadius: 2,
        boxShadow: 3,
        display: 'flex',
        alignItems: 'center',
        p: 1,
        gap: 1,
      }}
      style={style}
    >
      <Tooltip title="Crop/Resize">
        <IconButton
          onClick={() => handleClick('crop', onCrop)}
          color={cropMode || active === 'crop' ? 'primary' : 'default'}
          sx={cropMode || active === 'crop' ? { backgroundColor: '#e3f2fd', color: '#1976d2' } : {}}
        >
          <Crop />
        </IconButton>
      </Tooltip>
      <Tooltip title="Flip Horizontal">
        <IconButton
          onClick={() => handleClick('flipH', onFlipHorizontal)}
          color={active === 'flipH' ? 'primary' : 'default'}
          sx={active === 'flipH' ? { backgroundColor: '#e3f2fd', color: '#1976d2' } : {}}
        >
          <Flip sx={{ transform: 'scaleX(-1)' }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Flip Vertical">
        <IconButton
          onClick={() => handleClick('flipV', onFlipVertical)}
          color={active === 'flipV' ? 'primary' : 'default'}
          sx={active === 'flipV' ? { backgroundColor: '#e3f2fd', color: '#1976d2' } : {}}
        >
          <Flip sx={{ transform: 'scaleY(-1) rotate(90deg)' }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit (coming soon)"><span><IconButton disabled><Edit /></IconButton></span></Tooltip>
      <Tooltip title="Delete">
        <IconButton
          onClick={() => handleClick('delete', onDelete)}
          color={active === 'delete' ? 'primary' : 'default'}
          sx={active === 'delete' ? { backgroundColor: '#e3f2fd', color: '#1976d2' } : {}}
        >
          <Delete />
        </IconButton>
      </Tooltip>
      <Tooltip title="Bring Forward">
        <IconButton
          onClick={() => handleClick('bringForward', onBringForward)}
          color={active === 'bringForward' ? 'primary' : 'default'}
          sx={active === 'bringForward' ? { backgroundColor: '', color: '#1976d2' } : {}}
        >
          <Layers />
        </IconButton>
      </Tooltip>
      <Tooltip title="Send Backward">
        <IconButton
          onClick={() => handleClick('sendBackward', onSendBackward)}
          color={active === 'sendBackward' ? 'primary' : 'default'}
          sx={active === 'sendBackward' ? { backgroundColor: '#e3f2fd', color: '#1976d2' } : {}}
        >
          <Layers sx={{ transform: 'scaleX(-1)' }} />
        </IconButton>
      </Tooltip>
      <Tooltip title={isLocked ? 'Unlock' : 'Lock'}>
        <IconButton
          onClick={() => handleClick('lockToggle', onLockToggle)}
          color={active === 'lockToggle' ? 'primary' : 'default'}
          sx={active === 'lockToggle' ? { backgroundColor: '#e3f2fd', color: '#1976d2' } : {}}
        >
          {isLocked ? <Lock /> : <LockOpen />}
        </IconButton>
      </Tooltip>
      <Tooltip title="Reset Size">
        <IconButton
          onClick={() => handleClick('resetSize', onResetSize)}
          color={active === 'resetSize' ? 'primary' : 'default'}
          sx={active === 'resetSize' ? { backgroundColor: '#e3f2fd', color: '#1976d2' } : {}}
        >
          <Restore />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ImageToolbar; 