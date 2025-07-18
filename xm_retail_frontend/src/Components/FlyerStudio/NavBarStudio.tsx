import React from 'react';
import { Box, Button, Typography, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';

// Moved LoginRegisterButton from StudioPage.tsx
const LoginRegisterButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant="outlined"
    color="primary"
    onClick={onClick}
    sx={{
      minWidth: 40,
      flexDirection: 'column',
      color: 'white',
      borderColor: '#ff6726',
      borderWidth: 2,
      fontWeight: 600,
      fontSize: 13,
      lineHeight: 1.1,
      p: 0.5,
      background: '#ff6726',
      '&:hover': { borderColor: '#ff6726', background: '#ff6726', opacity: 0.9 },
    }}
  >
    <span style={{ color: 'white', fontSize: 11 }}>Login</span>
    <span style={{ color: 'white', fontSize: 9}}>Registration</span>
  </Button>
);

interface NavBarStudioProps {
  navigate: (path: string) => void;
  handleDownload: () => void;
  onOpenPost: () => void;
  onOpenSave: () => void;
  
  studioToken: string | null;
  profile: any;
  anchorEl: HTMLElement | null;
  open: boolean;
  handleProfileMenu: (event: React.MouseEvent<HTMLElement>) => void;
  handleCloseMenu: () => void;
  setStudioToken: (token: string | null) => void;
  onClearFlyer: () => void;
  flyer: any;
  canvasSize: { width: number; height: number };
  stageRef: any;
  onOpenShare: () => void;
}

const NavBarStudio: React.FC<NavBarStudioProps> = ({
  navigate,
  handleDownload,
  studioToken,
  profile,
  anchorEl,
  open,
  handleProfileMenu,
  handleCloseMenu,
  setStudioToken,
  onClearFlyer,
  flyer,
  canvasSize,
  stageRef,
  onOpenShare,
  onOpenSave,
  onOpenPost,
}) => {
  const requireLogin = (action: () => void) => {
    if (!studioToken || !profile) {
      navigate('/studio/login');
    } else {
      action();
    }
  };

  return (
    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1200, height: 56, background: '#fff', boxShadow: 2, display: 'flex', alignItems: 'center', px: 2 }}>
      <IconButton 
        onClick={() => navigate('/flyers')}
        sx={{ 
          mr: 2, 
          color: '#1976d2',
          '&:hover': { 
            background: '#f0f0f0',
            transform: 'translateX(-2px)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <ArrowBack />
      </IconButton>
      <Typography variant="h6" sx={{ flex: 1, fontWeight: 'bold', color: '#1976d2' }}>XM Studio</Typography>
      {/* Add global actions here: Undo, Redo, Save, Download, etc. */}
      <Button variant="outlined" sx={{ mx: 1 }} onClick={e => { requireLogin(() => { onOpenSave(); }); (e.currentTarget as HTMLButtonElement).blur(); }}>Save</Button>
      <Button variant="outlined" sx={{ mx: 1 }} onClick={e => { requireLogin(() => { handleDownload(); }); (e.currentTarget as HTMLButtonElement).blur(); }}>Download</Button>
      <Button
        variant="outlined"
        sx={{ mx: 1 }}
        onClick={e => { requireLogin(() => { onOpenShare(); }); (e.currentTarget as HTMLButtonElement).blur(); }}
      >
        Share
      </Button>
      <Button variant="outlined" sx={{ mx: 1 }} onClick={e => { requireLogin(() => { onOpenPost(); }); (e.currentTarget as HTMLButtonElement).blur(); }}>Post</Button>
      <Button variant="outlined" color="error" size="small" sx={{ mx: 1, fontWeight: 600 }} onClick={onClearFlyer}>Clear Flyer</Button>
      {/* Profile/Login button */}
      {studioToken && profile ? (
        <>
          <IconButton sx={{ ml: 2 }} onClick={handleProfileMenu}><Avatar>{profile.firstName?.[0] || profile.email?.[0] || profile.phone?.[0] || '?'}</Avatar></IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
            <MenuItem onClick={() => { handleCloseMenu(); navigate('/studio/profile'); }}>Profile</MenuItem>
            <MenuItem onClick={() => { handleCloseMenu(); localStorage.removeItem('studioToken'); setStudioToken(null); }}>Logout</MenuItem>
          </Menu>
        </>
      ) : (
        <LoginRegisterButton onClick={() => navigate('/studio/login')} />
      )}
    </Box>
  );
};

export default NavBarStudio; 