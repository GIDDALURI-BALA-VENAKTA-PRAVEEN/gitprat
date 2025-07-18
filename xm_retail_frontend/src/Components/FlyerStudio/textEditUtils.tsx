// textEditUtils.ts

// Utility functions for text editing features in FlyerStudio

import React from 'react';

export interface TextStyle {
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  letterSpacing?: number;
  listType?: 'bullet' | 'number';
  effect?: string;
  animation?: string;
  position?: { x: number; y: number };
  margin?: number;
  padding?: number;
  // Add more as needed
}


export function toggleBold(style: TextStyle): TextStyle {
  return { ...style, fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold' };
}

export function toggleItalic(style: TextStyle): TextStyle {
  return { ...style, fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic' };
}

export function toggleUnderline(style: TextStyle): TextStyle {
  return { ...style, textDecoration: style.textDecoration === 'underline' ? 'none' : 'underline' };
}

export function toggleStrikethrough(style: TextStyle): TextStyle {
  return { ...style, textDecoration: style.textDecoration === 'line-through' ? 'none' : 'line-through' };
}

export function setFontFamily(style: TextStyle, fontFamily: string): TextStyle {
  return { ...style, fontFamily };
}

export function setFontSize(style: TextStyle, fontSize: number): TextStyle {
  return { ...style, fontSize };
}

export function setFontColor(style: TextStyle, color: string): TextStyle {
  return { ...style, color };
}

export function setTextCase(text: string, to: 'upper' | 'lower'): string {
  return to === 'upper' ? text.toUpperCase() : text.toLowerCase();
}

export function setTextUppercase(text: string): string {
  return text.toUpperCase();
}

export function setTextLowercase(text: string): string {
  return text.toLowerCase();
}

export function setTextAlign(style: TextStyle, align: 'left' | 'center' | 'right' | 'justify'): TextStyle {
  return { ...style, textAlign: align };
}

export function setLineHeight(style: TextStyle, lineHeight: number): TextStyle {
  return { ...style, lineHeight };
}

export function setLetterSpacing(style: TextStyle, letterSpacing: number): TextStyle {
  return { ...style, letterSpacing };
}

// Add more as needed (e.g., line height, letter spacing, etc.)

// ColorPicker component for text color selection
export const colorPalette = [
  '#000000', '#434343', '#666666', '#999999', '#cccccc', '#ffffff',
  '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#0000ff',
  '#9900ff', '#ff00ff', '#ff99cc', '#ffcc99', '#ffff99', '#ccffcc',
  '#ccffff', '#99ccff', '#cc99ff', '#ffffff', '#f8fafc', '#e0e7ff',
];

interface ColorPickerProps {
  open: boolean;
  selectedColor: string;
  onSelect: (color: string) => void;
  onClose: () => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ open, selectedColor, onSelect, onClose }) => {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 140,
        left: 60, // <-- adjust this to match your main sidebar width
        width: 320,
        height: '100vh',
        background: '#fff',
        borderRight: '1px solid #e0e7ff',
        boxShadow: '2px 0 16px 0 rgba(80, 80, 180, 0.10)',
        zIndex: 3000,
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 0 24px' }}>
        <div style={{ fontWeight: 700, fontSize: 20 }}>Text color</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#888' }}>&times;</button>
      </div>
      <div style={{ padding: 24, paddingTop: 16, overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {colorPalette.map((color, idx) => (
            <div
              key={color + idx}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: color,
                border: color === selectedColor ? '3px solid #7c3aed' : '2px solid #e0e7ff',
                cursor: 'pointer',
                boxShadow: color === selectedColor ? '0 0 0 3px #ede9fe' : 'none',
                margin: 2,
              }}
              onClick={() => onSelect(color)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Simple canvas text drawing function and CanvasTextEditor demo moved from TextEditPanel.tsx
export function drawTextOnCanvas(ctx: CanvasRenderingContext2D, text: string, style: any, x: number, y: number) {
  ctx.save();
  ctx.font = `${style.fontWeight || 'normal'} ${style.fontStyle || 'normal'} 16px Arial`;
  ctx.fillStyle = style.color || '#000';
  ctx.textBaseline = 'top';
  if (style.textDecoration === 'underline') {
    ctx.fillText(text, x, y);
    const textWidth = ctx.measureText(text).width;
    ctx.beginPath();
    ctx.strokeStyle = style.color || '#000';
    ctx.lineWidth = 2;
    ctx.moveTo(x, y + 20); // Adjust as needed for underline position
    ctx.lineTo(x + textWidth, y + 20);
    ctx.stroke();
  } else {
    ctx.fillText(text, x, y);
  }
  ctx.restore();
}

export const CanvasTextEditor: React.FC = () => {
  const [text, setText] = React.useState('Hello World');
  const [style, setStyle] = React.useState<any>({ color: '#000' });
  const [colorPickerOpen, setColorPickerOpen] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Redraw on text or style change
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTextOnCanvas(ctx, text, style, 10, 20);
  }, [text, style]);

  // Style handler: always apply to entire text box
  const handleStyleChange = (newStyle: any) => {
    setStyle((prev: any) => ({ ...prev, ...newStyle }));
  };

  // Color picker logic
  const handleColorPick = (color: string) => {
    handleStyleChange({ color });
    setColorPickerOpen(false);
  };

  const isBoldActive = style.fontWeight === 'bold';
  const isItalicActive = style.fontStyle === 'italic';
  const isUnderlineActive = style.textDecoration === 'underline';

  return (
    <div style={{ margin: '32px 0' }}>
      <canvas
        ref={canvasRef}
        width={600}
        height={80}
        style={{ border: '1px solid #ccc', marginBottom: 8, cursor: 'text' }}
      />
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        style={{ marginBottom: 8, width: 300, fontSize: 16 }}
        placeholder="Edit text here"
      />
      <div className="toolbar" style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button
          style={{
            background: isBoldActive ? '#ede9fe' : 'transparent',
            color: '#7c3aed',
            border: isBoldActive ? '2px solid #7c3aed' : '1px solid #e0e7ff',
            borderRadius: 4,
            fontWeight: 700,
            padding: '4px 12px',
            cursor: 'pointer',
          }}
          onClick={() => handleStyleChange({ fontWeight: isBoldActive ? 'normal' : 'bold' })}
        >
          Bold
        </button>
        <button
          style={{
            background: isItalicActive ? '#ede9fe' : 'transparent',
            color: '#7c3aed',
            border: isItalicActive ? '2px solid #7c3aed' : '1px solid #e0e7ff',
            borderRadius: 4,
            fontWeight: 700,
            padding: '4px 12px',
            cursor: 'pointer',
          }}
          onClick={() => handleStyleChange({ fontStyle: isItalicActive ? 'normal' : 'italic' })}
        >
          Italic
        </button>
        <button
          style={{
            background: isUnderlineActive ? '#ede9fe' : 'transparent',
            color: '#7c3aed',
            border: isUnderlineActive ? '2px solid #7c3aed' : '1px solid #e0e7ff',
            borderRadius: 4,
            fontWeight: 700,
            padding: '4px 12px',
            cursor: 'pointer',
          }}
          onClick={() => handleStyleChange({ textDecoration: isUnderlineActive ? 'none' : 'underline' })}
        >
          Underline
        </button>
        <button
          style={{
            background: '#f3e8ff',
            color: '#3730a3',
            border: '1px solid #e0e7ff',
            borderRadius: 4,
            fontWeight: 700,
            padding: '4px 12px',
            cursor: 'pointer',
            boxShadow: colorPickerOpen ? '0 0 0 2px #7c3aed' : undefined,
            outline: style.color,
          }}
          onClick={() => setColorPickerOpen(true)}
        >
          Font Color
          <span
            style={{
              display: 'inline-block',
              width: 16,
              height: 16,
              background: style.color,
              border: '1px solid #7c3aed',
              borderRadius: 4,
              marginLeft: 6,
              verticalAlign: 'middle',
            }}
          />
        </button>
      </div>
      <ColorPicker
        open={colorPickerOpen}
        selectedColor={style.color}
        onSelect={handleColorPick}
        onClose={() => setColorPickerOpen(false)}
      />
      <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
        All style changes apply to the entire text box content. The toolbar and color picker reflect the current style.
      </div>
    </div>
  );
};

// List utilities (for future implementation)
export function toggleBulletList(style: TextStyle): TextStyle {
  // This is a stub. Actual implementation depends on text rendering engine.
  return { ...style, listType: style.listType === 'bullet' ? undefined : 'bullet' };
}

export function toggleNumberedList(style: TextStyle): TextStyle {
  // This is a stub. Actual implementation depends on text rendering engine.
  return { ...style, listType: style.listType === 'number' ? undefined : 'number' };
}

export function applyBulletList(text: string): string {
  // Split text into lines, prefix each with a bullet if not already
  return text
    .split('\n')
    .map(line => line.trim().startsWith('•') ? line : `• ${line}`)
    .join('\n');
}

export function applyNumberedList(text: string): string {
  // Split text into lines, prefix each with a number if not already
  return text
    .split('\n')
    .map((line, idx) => line.trim().match(/^\d+\./) ? line : `${idx + 1}. ${line}`)
    .join('\n');
}

export function isBulletList(text: string): boolean {
  return text.split('\n').every(line => line.trim().startsWith('•'));
}

export function isNumberedList(text: string): boolean {
  return text.split('\n').every(line => /^\d+\./.test(line.trim()));
}

// Effects utility (stub)
export function applyTextEffect(style: TextStyle, effect: string): TextStyle {
  // Example: effect could be 'shadow', 'glow', etc.
  return { ...style, effect };
}

// Animate utility (stub)
export function setTextAnimation(style: TextStyle, animation: string): TextStyle {
  // Example: animation could be 'bounce', 'fade', etc.
  return { ...style, animation };
}

// Position utility (stub)
export function setTextPosition(style: TextStyle, position: { x: number; y: number }): TextStyle {
  // This would typically be handled outside of style, but stub included for completeness
  return { ...style, position };
}

// Spacing utilities
export function setMargin(style: TextStyle, margin: number): TextStyle {
  return { ...style, margin };
}

export function setPadding(style: TextStyle, padding: number): TextStyle {
  return { ...style, padding };
}
