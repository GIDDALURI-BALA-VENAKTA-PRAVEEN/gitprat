import React from 'react';
import { Box, IconButton, TextField, Tooltip, Select, MenuItem, Button, ButtonGroup, Divider } from '@mui/material';
import { Delete, FormatBold, FormatItalic, FormatUnderlined, FormatStrikethrough, FormatColorText, FormatListBulleted, FormatListNumbered, FormatAlignLeft, FormatAlignCenter, FormatAlignRight, FormatAlignJustify, ArrowDropUp, ArrowDropDown, TextFields, TextFormat, FormatSize, FormatColorFill, FormatPaint, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import {
  ColorPicker,
  CanvasTextEditor,
  toggleStrikethrough,
  setTextAlign,
  setTextCase,
  setLineHeight,
  setLetterSpacing,
  setTextUppercase,
  setTextLowercase,
  applyBulletList,
  applyNumberedList,
  isBulletList,
  isNumberedList
} from './textEditUtils.tsx';

interface TextEditPanelProps {
  el: any;
  editing: boolean;
  editingValue: string;
  onChange: (attrs: any) => void;
  onDelete: () => void;
  onEditChange: (val: string) => void;
  onEditBlur: () => void;
  onEditKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const fontFamilies = ['Canva Sans', 'Arial', 'Roboto', 'Georgia'];

const TextEditPanel: React.FC<TextEditPanelProps> = ({
  el,
  editing,
  editingValue,
  onChange,
  onDelete,
  onEditChange,
  onEditBlur,
  onEditKeyDown,
}) => {
  const [colorDrawerOpen, setColorDrawerOpen] = React.useState(false);

  // Determine active styles for the selected text box
  const isBoldActive = el.fontWeight === 'bold';
  const isItalicActive = el.fontStyle === 'italic';
  const isUnderlineActive = el.textDecoration === 'underline';
  const currentColor = el.fill || '#000';
  
  const isStrikethroughActive = el.textDecoration === 'line-through';
  const isAlignLeft = el.textAlign === 'left' || !el.textAlign;
  const isAlignCenter = el.textAlign === 'center';
  const isAlignRight = el.textAlign === 'right';
  const isAlignJustify = el.textAlign === 'justify';
  const lineHeight = el.lineHeight || 1.2;
  const letterSpacing = el.letterSpacing || 0;
  const isUppercase = el.text && el.text === el.text.toUpperCase() && el.text.length > 0;
  const isLowercase = el.text && el.text === el.text.toLowerCase() && el.text.length > 0;
  const isBullet = el.text && isBulletList(el.text);
  const isNumbered = el.text && isNumberedList(el.text);

  return (
    <>
      {/* Canva-style floating toolbar */}
      <Box
        sx={{
          background: '#fff',
          borderRadius: 3,
          boxShadow: '0 4px 16px 0 rgba(80, 80, 180, 0.10)',
          border: '1px solid #e0e7ff',
          display: 'flex',
          alignItems: 'center',
          p: 0.5,
          gap: 0.5,
          minWidth: 0,
          width: 'max-content',
          maxWidth: '100vw',
          flexWrap: 'nowrap',
          overflow: 'hidden',
          margin: '16px auto 0 auto', // center horizontally, add top margin
        }}
      >
        {/* Font Family */}
        <Select
          value={el.fontFamily || 'Canva Sans'}
          onChange={e => onChange({ id: el.id, fontFamily: e.target.value })}
          size="small"
          sx={{
            borderRadius: 2,
            fontWeight: 500,
            fontSize: 14,
            background: '#f8fafc',
            minWidth: 90,
            mr: 0.5,
            height: 32,
          }}
        >
          {fontFamilies.map(f => (
            <MenuItem value={f} key={f} sx={{ fontSize: 14 }}>{f}</MenuItem>
          ))}
        </Select>
        {/* Font Size Stepper */}
        <ButtonGroup size="small" sx={{ borderRadius: 2, background: '#f8fafc', mr: 0.5, height: 32 }}>
          <Button onClick={() => onChange({ id: el.id, fontSize: Math.max(1, (el.fontSize || 16) - 1) })} sx={{ minWidth: 28, p: 0 }}><ArrowDropDown fontSize="small" /></Button>
          <TextField
            value={el.fontSize || 16}
            onChange={e => onChange({ id: el.id, fontSize: Number(e.target.value) })}
            size="small"
            sx={{ width: 36, '& .MuiInputBase-root': { borderRadius: 0, textAlign: 'center', height: 32 }, '& input': { p: 0, fontSize: 14, textAlign: 'center' } }}
            inputProps={{ style: { textAlign: 'center', padding: 0 } }}
          />
          <Button onClick={() => onChange({ id: el.id, fontSize: (el.fontSize || 16) + 1 })} sx={{ minWidth: 28, p: 0 }}><ArrowDropUp fontSize="small" /></Button>
        </ButtonGroup>
        {/* Font Color */}
        <Tooltip title="Font Color">
          <IconButton
            sx={{
              borderRadius: 2,
              background: '#f3e8ff',
              color: '#3730a3',
              mx: 0.2,
              p: 0.5,
              height: 32,
              width: 32,
              border: `2px solid ${colorDrawerOpen ? '#7c3aed' : '#e0e7ff'}`,
              boxShadow: colorDrawerOpen ? '0 0 0 2px #7c3aed' : undefined,
            }}
            onClick={() => setColorDrawerOpen(true)}
          >
            <FormatColorText fontSize="small" />
            <span
              key={el.fill}
              style={{
                display: 'inline-block',
                width: 16,
                height: 16,
                background: el.fill || '#000',
                border: '1px solid #7c3aed',
                borderRadius: 4,
                marginLeft: 6,
                verticalAlign: 'middle',
                transition: 'background 0.2s',
              }}
            />
          </IconButton>
        </Tooltip>
        {/* Use centralized ColorPicker */}
        <ColorPicker
          open={colorDrawerOpen}
          selectedColor={el.fill || '#000'}
          onSelect={color => { onChange({ id: el.id, fill: color }); setColorDrawerOpen(false); }}
          onClose={() => setColorDrawerOpen(false)}
        />
        {/* Bold, Italic, Underline, Strikethrough */}
        <ButtonGroup sx={{ background: 'transparent', boxShadow: 'none', gap: 0.2, height: 32 }}>
          <IconButton
            sx={{
              borderRadius: 2,
              background: isBoldActive ? '#ede9fe' : '#ede9fe',
              color: isBoldActive ? '#7c3aed' : '#a3a3a3',
              mx: 0.1,
              p: 0.5,
              height: 32,
              width: 32,
              border: isBoldActive ? '2px solid #7c3aed' : '1px solid #e0e7ff',
            }}
            onClick={() => onChange({ id: el.id, fontWeight: isBoldActive ? 'normal' : 'bold' })}
          >
            <FormatBold fontSize="small" />
          </IconButton>
          <IconButton
            sx={{
              borderRadius: 2,
              background: isItalicActive ? '#ede9fe' : '#ede9fe',
              color: isItalicActive ? '#7c3aed' : '#a3a3a3',
              mx: 0.1,
              p: 0.5,
              height: 32,
              width: 32,
              border: isItalicActive ? '2px solid #7c3aed' : '1px solid #e0e7ff',
            }}
            onClick={() => onChange({ id: el.id, fontStyle: isItalicActive ? 'normal' : 'italic' })}
          >
            <FormatItalic fontSize="small" />
          </IconButton>
          <IconButton
            sx={{
              borderRadius: 2,
              background: isUnderlineActive ? '#ede9fe' : '#ede9fe',
              color: isUnderlineActive ? '#7c3aed' : '#a3a3a3',
              mx: 0.1,
              p: 0.5,
              height: 32,
              width: 32,
              border: isUnderlineActive ? '2px solid #7c3aed' : '1px solid #e0e7ff',
            }}
            onClick={() => onChange({ id: el.id, textDecoration: isUnderlineActive ? 'none' : 'underline' })}
          >
            <FormatUnderlined fontSize="small" />
          </IconButton>
          <IconButton
            sx={{
              borderRadius: 2,
              background: isStrikethroughActive ? '#ede9fe' : '#ede9fe',
              color: isStrikethroughActive ? '#7c3aed' : '#a3a3a3',
              mx: 0.1,
              p: 0.5,
              height: 32,
              width: 32,
              border: isStrikethroughActive ? '2px solid #7c3aed' : '1px solid #e0e7ff',
            }}
            onClick={() => onChange({ id: el.id, textDecoration: isStrikethroughActive ? 'none' : 'line-through' })}
          >
            <FormatStrikethrough fontSize="small" />
          </IconButton>
        </ButtonGroup>
        {/* Uppercase, Lowercase */}
        <ButtonGroup sx={{ background: 'transparent', boxShadow: 'none', gap: 0.2, height: 32 }}>
          <Tooltip title="Uppercase">
            <IconButton sx={{
              borderRadius: 2,
              background: isUppercase ? '#ede9fe' : '#ede9fe',
              color: isUppercase ? '#7c3aed' : '#a3a3a3',
              mx: 0.1,
              p: 0.5,
              height: 32,
              width: 32,
              border: isUppercase ? '2px solid #7c3aed' : '1px solid #e0e7ff',
            }}
              onClick={() => {
                if (editing) {
                  onEditChange(setTextUppercase(editingValue));
                } else {
                  onChange({ id: el.id, text: setTextUppercase(el.text) });
                }
              }}
            >
              <TextFields fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Lowercase">
            <IconButton sx={{
              borderRadius: 2,
              background: isLowercase ? '#ede9fe' : '#ede9fe',
              color: isLowercase ? '#7c3aed' : '#a3a3a3',
              mx: 0.1,
              p: 0.5,
              height: 32,
              width: 32,
              border: isLowercase ? '2px solid #7c3aed' : '1px solid #e0e7ff',
            }}
              onClick={() => {
                if (editing) {
                  onEditChange(setTextLowercase(editingValue));
                } else {
                  onChange({ id: el.id, text: setTextLowercase(el.text) });
                }
              }}
            >
              <TextFormat fontSize="small" />
            </IconButton>
          </Tooltip>
        </ButtonGroup>
        {/* Alignment */}
        <ButtonGroup sx={{ background: 'transparent', boxShadow: 'none', gap: 0.2, height: 32 }}>
          <Tooltip title="Align Left">
            <IconButton sx={{ borderRadius: 2, background: isAlignLeft ? '#ede9fe' : '#ede9fe', color: isAlignLeft ? '#7c3aed' : '#a3a3a3', mx: 0.1, p: 0.5, height: 32, width: 32, border: isAlignLeft ? '2px solid #7c3aed' : '1px solid #e0e7ff' }}
              onClick={() => onChange({ id: el.id, textAlign: 'left' })}
            >
              <FormatAlignLeft fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Center">
            <IconButton sx={{ borderRadius: 2, background: isAlignCenter ? '#ede9fe' : '#ede9fe', color: isAlignCenter ? '#7c3aed' : '#a3a3a3', mx: 0.1, p: 0.5, height: 32, width: 32, border: isAlignCenter ? '2px solid #7c3aed' : '1px solid #e0e7ff' }}
              onClick={() => onChange({ id: el.id, textAlign: 'center' })}
            >
              <FormatAlignCenter fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Right">
            <IconButton sx={{ borderRadius: 2, background: isAlignRight ? '#ede9fe' : '#ede9fe', color: isAlignRight ? '#7c3aed' : '#a3a3a3', mx: 0.1, p: 0.5, height: 32, width: 32, border: isAlignRight ? '2px solid #7c3aed' : '1px solid #e0e7ff' }}
              onClick={() => onChange({ id: el.id, textAlign: 'right' })}
            >
              <FormatAlignRight fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Justify">
            <IconButton sx={{ borderRadius: 2, background: isAlignJustify ? '#ede9fe' : '#ede9fe', color: isAlignJustify ? '#7c3aed' : '#a3a3a3', mx: 0.1, p: 0.5, height: 32, width: 32, border: isAlignJustify ? '2px solid #7c3aed' : '1px solid #e0e7ff' }}
              onClick={() => onChange({ id: el.id, textAlign: 'justify' })}
            >
              <FormatAlignJustify fontSize="small" />
            </IconButton>
          </Tooltip>
        </ButtonGroup>
        {/* List, Line Height, Letter Spacing */}
        <ButtonGroup sx={{ background: 'transparent', boxShadow: 'none', gap: 0.2, height: 32 }}>
          <Tooltip title="Bulleted List">
            <IconButton sx={{
              borderRadius: 2,
              background: isBullet ? '#ede9fe' : '#ede9fe',
              color: isBullet ? '#7c3aed' : '#a3a3a3',
              mx: 0.1,
              p: 0.5,
              height: 32,
              width: 32,
              border: isBullet ? '2px solid #7c3aed' : '1px solid #e0e7ff',
            }}
              onClick={() => {
                if (editing) {
                  onEditChange(isBullet ? el.text.replace(/^• /gm, '') : applyBulletList(editingValue));
                } else {
                  onChange({ id: el.id, text: isBullet ? el.text.replace(/^• /gm, '') : applyBulletList(el.text) });
                }
              }}
            >
              <FormatListBulleted fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered List">
            <IconButton sx={{
              borderRadius: 2,
              background: isNumbered ? '#ede9fe' : '#ede9fe',
              color: isNumbered ? '#7c3aed' : '#a3a3a3',
              mx: 0.1,
              p: 0.5,
              height: 32,
              width: 32,
              border: isNumbered ? '2px solid #7c3aed' : '1px solid #e0e7ff',
            }}
              onClick={() => {
                if (editing) {
                  onEditChange(isNumbered ? editingValue.replace(/^\d+\. /gm, '') : applyNumberedList(editingValue));
                } else {
                  onChange({ id: el.id, text: isNumbered ? el.text.replace(/^\d+\. /gm, '') : applyNumberedList(el.text) });
                }
              }}
            >
              <FormatListNumbered fontSize="small" />
            </IconButton>
          </Tooltip>
          {/* Line Height Stepper */}
          <Box sx={{ display: 'flex', alignItems: 'center', mx: 0.5 }}>
            <Tooltip title="Decrease Line Height">
              <IconButton sx={{ borderRadius: 2, background: '#ede9fe', color: '#7c3aed', height: 28, width: 28, mx: 0.1 }}
                onClick={() => onChange({ id: el.id, lineHeight: Math.max(0.5, lineHeight - 0.1) })}
              >
                <ArrowDownward fontSize="small" />
              </IconButton>
            </Tooltip>
            <TextField
              value={lineHeight}
              onChange={e => onChange({ id: el.id, lineHeight: Number(e.target.value) })}
              size="small"
              sx={{ width: 36, mx: 0.2, '& .MuiInputBase-root': { borderRadius: 1, textAlign: 'center', height: 28 }, '& input': { p: 0, fontSize: 13, textAlign: 'center' } }}
              inputProps={{ style: { textAlign: 'center', padding: 0, width: 24 } }}
            />
            <Tooltip title="Increase Line Height">
              <IconButton sx={{ borderRadius: 2, background: '#ede9fe', color: '#7c3aed', height: 28, width: 28, mx: 0.1 }}
                onClick={() => onChange({ id: el.id, lineHeight: lineHeight + 0.1 })}
              >
                <ArrowUpward fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          {/* Letter Spacing Stepper */}
          <Box sx={{ display: 'flex', alignItems: 'center', mx: 0.5 }}>
            <Tooltip title="Decrease Letter Spacing">
              <IconButton sx={{ borderRadius: 2, background: '#ede9fe', color: '#7c3aed', height: 28, width: 28, mx: 0.1 }}
                onClick={() => onChange({ id: el.id, letterSpacing: Math.max(0, letterSpacing - 0.5) })}
              >
                <ArrowDownward fontSize="small" />
              </IconButton>
            </Tooltip>
            <TextField
              value={letterSpacing}
              onChange={e => onChange({ id: el.id, letterSpacing: Number(e.target.value) })}
              size="small"
              sx={{ width: 36, mx: 0.2, '& .MuiInputBase-root': { borderRadius: 1, textAlign: 'center', height: 28 }, '& input': { p: 0, fontSize: 13, textAlign: 'center' } }}
              inputProps={{ style: { textAlign: 'center', padding: 0, width: 24 } }}
            />
            <Tooltip title="Increase Letter Spacing">
              <IconButton sx={{ borderRadius: 2, background: '#ede9fe', color: '#7c3aed', height: 28, width: 28, mx: 0.1 }}
                onClick={() => onChange({ id: el.id, letterSpacing: letterSpacing + 0.5 })}
              >
                <ArrowUpward fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </ButtonGroup>
        {/* Effects, Animate, Position, Paint Roller */}
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: '#e0e7ff', height: 24 }} />
        <Tooltip title="Delete">
          <span>
            <IconButton
              sx={{
                borderRadius: 2,
                background: '#fee2e2',
                color: '#dc2626',
                mx: 0.2,
                p: 0.5,
                height: 32,
                width: 32,
                border: '2px solid #fecaca',
                boxShadow: 'none',
              }}
              onClick={onDelete}
            >
              <Delete fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        
      </Box>
      
    </>
  );
};

export default TextEditPanel; 