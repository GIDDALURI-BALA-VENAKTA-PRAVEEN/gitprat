import React, { useState } from 'react';
import { Box, Button, Typography, Divider } from '@mui/material';

interface TextSidebarProps {
  flyer: any;
  setFlyer: (f: any) => void;
  saveFlyerToStorage: (f: any) => void;
}

const TextSidebar: React.FC<TextSidebarProps> = ({ flyer, setFlyer, saveFlyerToStorage }) => {
  const [dynamicText, setDynamicText] = useState('');
  const addTextBox = () => {
    const newFlyer = {
      ...flyer,
      elements: [
        ...flyer.elements,
        {
          id: Date.now() + Math.random(),
          type: 'text',
          text: 'Double-click to edit',
          x: 120,
          y: 120,
          fontSize: 32,
          fill: '#222',
          width: 200,
          rotation: 0,
        },
      ],
    };
    setFlyer(newFlyer);
    saveFlyerToStorage(newFlyer);
  };
  const addHeading = () => {
    const newFlyer = {
      ...flyer,
      elements: [
        ...flyer.elements,
        {
          id: Date.now() + Math.random(),
          type: 'text',
          text: 'Add a heading',
          x: 100,
          y: 100,
          fontSize: 36,
          fill: '#222',
          width: 300,
          rotation: 0,
          fontWeight: 'bold',
        },
      ],
    };
    setFlyer(newFlyer);
    saveFlyerToStorage(newFlyer);
  };
  const addSubheading = () => {
    const newFlyer = {
      ...flyer,
      elements: [
        ...flyer.elements,
        {
          id: Date.now() + Math.random(),
          type: 'text',
          text: 'Add a subheading',
          x: 100,
          y: 160,
          fontSize: 28,
          fill: '#444',
          width: 260,
          rotation: 0,
          fontWeight: 600,
        },
      ],
    };
    setFlyer(newFlyer);
    saveFlyerToStorage(newFlyer);
  };
  const addBodyText = () => {
    const newFlyer = {
      ...flyer,
      elements: [
        ...flyer.elements,
        {
          id: Date.now() + Math.random(),
          type: 'text',
          text: 'Add a little bit of body text',
          x: 100,
          y: 220,
          fontSize: 18,
          fill: '#555',
          width: 220,
          rotation: 0,
          fontWeight: 400,
        },
      ],
    };
    setFlyer(newFlyer);
    saveFlyerToStorage(newFlyer);
  };

  const addDynamicText = () => {
    if (!dynamicText.trim()) return;
    const newFlyer = {
      ...flyer,
      elements: [
        ...flyer.elements,
        {
          id: Date.now() + Math.random(),
          type: 'text',
          text: dynamicText,
          x: 120,
          y: 300,
          fontSize: 22,
          fill: '#333',
          width: 240,
          rotation: 0,
          fontWeight: 500,
        },
      ],
    };
    setFlyer(newFlyer);
    saveFlyerToStorage(newFlyer);
    setDynamicText('');
  };
  return (
    <Box
      sx={{
        p: 3,
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)',
        borderRadius: 4,
        boxShadow: '0 6px 32px 0 rgba(80, 80, 180, 0.10)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 2,
      }}
    >
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{
          mb: 2,
          borderRadius: 3,
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 0.5,
          boxShadow: '0 2px 8px 0 rgba(80, 80, 180, 0.10)',
          background: 'linear-gradient(90deg, #6366f1 60%, #818cf8 100%)',
          transition: 'background 0.2s',
          '&:hover': { background: 'linear-gradient(90deg, #818cf8 60%, #6366f1 100%)' },
        }}
        onClick={addTextBox}
      >
        Add a text box
      </Button>
      <Divider sx={{ my: 2, borderColor: '#c7d2fe' }} />
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800, color: '#3730a3', letterSpacing: 1 }}>Default text styles</Typography>
      <Button
        variant="outlined"
        fullWidth
        sx={{
          mb: 1,
          borderRadius: 2,
          fontWeight: 800,
          fontSize: 22,
          py: 2,
          textTransform: 'none',
          borderColor: '#6366f1',
          color: '#3730a3',
          background: '#f1f5f9',
          '&:hover': { background: '#e0e7ff', borderColor: '#3730a3', color: '#3730a3' },
        }}
        onClick={addHeading}
      >
        Add a heading
      </Button>
      <Button
        variant="outlined"
        fullWidth
        sx={{
          mb: 1,
          borderRadius: 2,
          fontWeight: 700,
          fontSize: 18,
          py: 1.5,
          textTransform: 'none',
          borderColor: '#818cf8',
          color: '#3730a3',
          background: '#f1f5f9',
          '&:hover': { background: '#e0e7ff', borderColor: '#3730a3', color: '#3730a3' },
        }}
        onClick={addSubheading}
      >
        Add a subheading
      </Button>
      <Button
        variant="outlined"
        fullWidth
        sx={{
          mb: 2,
          borderRadius: 2,
          fontWeight: 500,
          fontSize: 15,
          py: 1,
          textTransform: 'none',
          borderColor: '#a5b4fc',
          color: '#3730a3',
          background: '#f1f5f9',
          '&:hover': { background: '#e0e7ff', borderColor: '#3730a3', color: '#3730a3' },
        }}
        onClick={addBodyText}
      >
        Add a little bit of body text
      </Button>
      <Divider sx={{ my: 2, borderColor: '#c7d2fe' }} />
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800, color: '#3730a3', letterSpacing: 1 }}>Dynamic text</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <input
          type="text"
          value={dynamicText}
          onChange={e => setDynamicText(e.target.value)}
          placeholder="Type your text..."
          style={{
            flex: 1,
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1.5px solid #a5b4fc',
            fontSize: '16px',
            outline: 'none',
            background: '#f8fafc',
            transition: 'border 0.2s, box-shadow 0.2s',
            boxShadow: '0 1px 4px 0 rgba(80, 80, 180, 0.06)',
          }}
          onFocus={e => (e.target.style.border = '1.5px solid #6366f1')}
          onBlur={e => (e.target.style.border = '1.5px solid #a5b4fc')}
          onKeyDown={e => { if (e.key === 'Enter') addDynamicText(); }}
        />
      
        <Button
          variant="contained"
          color="secondary"
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            fontSize: 16,
            px: 2.5,
            textTransform: 'none',
            minWidth: 'unset',
            background: 'linear-gradient(90deg, #818cf8 60%, #6366f1 100%)',
            boxShadow: '0 2px 8px 0 rgba(80, 80, 180, 0.10)',
            '&:hover': { background: 'linear-gradient(90deg, #6366f1 60%, #818cf8 100%)' },
          }}
          onClick={addDynamicText}
          disabled={!dynamicText.trim()}
        >
          Add
        </Button>
      </Box>
      <Button
        variant="outlined"
        fullWidth
        sx={{
          borderRadius: 2,
          fontWeight: 600,
          fontSize: 15,
          py: 1,
          textTransform: 'none',
          opacity: 0.6,
          borderColor: '#a5b4fc',
          color: '#3730a3',
          background: '#f1f5f9',
        }}
        disabled
      >
        Page numbers (coming soon)
      </Button>
    </Box>
  );
};

export default TextSidebar; 