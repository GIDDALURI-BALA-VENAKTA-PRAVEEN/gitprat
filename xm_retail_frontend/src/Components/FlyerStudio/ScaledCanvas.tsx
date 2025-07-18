import React from 'react';
import { Stage, Layer, Rect, Text as KonvaText, Image as KonvaImage, Transformer, Group, Circle } from 'react-konva';
import CanvasTextElement from './CanvasTextElement';
import { isBulletList, isNumberedList } from './textEditUtils';

interface ScaledCanvasProps {
  width: number;
  height: number;
  displayWidth: number;
  displayHeight: number;
  stageRef?: React.RefObject<any>;
  style?: React.CSSProperties;
  flyer: any;
  selectedId: string | null;
  images: { [url: string]: HTMLImageElement | undefined };
  isGuest: boolean;
  lockedElements: string[];
  trRef: React.RefObject<any>;
  zoom?: number;
  backgroundColor?: string;
  onMouseDown?: (e: any) => void;
  onTouchStart?: (e: any) => void;
  onSelect: (id: string) => void;
  onTransform: (id: string, newAttrs: any) => void;
  onDelete: () => void;
  setEditingTextId: (id: string | null) => void;
  cropResizeId?: string | null;
}

const ScaledCanvas: React.FC<ScaledCanvasProps & {
  editingTextId?: string | null;
  editingTextValue?: string;
  setEditingTextValue?: (val: string) => void;
  handleTextEdit?: (id: string, value: string) => void;
}> = ({
  width,
  height,
  displayWidth,
  displayHeight,
  stageRef,
  style,
  flyer,
  selectedId,
  images,
  isGuest,
  lockedElements,
  trRef, // not used anymore, will use local refs
  zoom = 1,
  backgroundColor = '#fff',
  onMouseDown,
  onTouchStart,
  onSelect,
  onTransform,
  onDelete,
  setEditingTextId,
  cropResizeId = null,
  editingTextId,
  editingTextValue,
  setEditingTextValue,
  handleTextEdit,
}) => {
  // Calculate scale to fit the flyer into the display area, then apply zoom
  const baseScale = Math.min(displayWidth / width, displayHeight / height);
  const scale = baseScale * zoom;
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  // Refs for selected shape and transformer
  const selectedShapeRef = React.useRef<any>(null);
  const transformerRef = React.useRef<any>(null);

  // Attach Transformer to selected shape immediately after DOM update
  React.useLayoutEffect(() => {
    if (selectedShapeRef.current && transformerRef.current) {
      transformerRef.current.nodes([selectedShapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [cropResizeId, flyer, isGuest, lockedElements]);

  // Inline text editing overlay
  let editingTextarea: React.ReactNode = null;
  // Place these at the top level of the component
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editingTextValue]);

  if (editingTextId && editingTextValue !== undefined) {
    const el = flyer.elements.find((e: any) => e.id === editingTextId && e.type === 'text');
    if (el) {
      // Calculate scaled position and size
      const left = el.x * scale;
      const top = el.y * scale;
      const widthPx = (el.width || 200) * scale;
      const fontSizePx = (el.fontSize || 16) * scale;
      editingTextarea = (
        <textarea
          ref={textareaRef}
          value={editingTextValue}
          autoFocus
          style={{
            position: 'absolute',
            left,
            top,
            width: widthPx,
            fontSize: fontSizePx,
            fontFamily: el.fontFamily,
            fontWeight: el.fontWeight,
            fontStyle: el.fontStyle,
            color: el.fill,
            lineHeight: el.lineHeight || 1.2,
            letterSpacing: el.letterSpacing || 0,
            background: 'transparent',
            border: '1px dashed #7c3aed',
            outline: 'none',
            resize: 'none',
            overflow: 'hidden', // Hide scroll bar
            minHeight: fontSizePx * 1.2,
            zIndex: 10,
          }}
          onChange={e => setEditingTextValue && setEditingTextValue(e.target.value)}
          onBlur={() => {
            if (handleTextEdit) handleTextEdit(el.id, editingTextValue);
            if (setEditingTextId) setEditingTextId(null);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              // List auto-prefix logic
              const isBullet = isBulletList(editingTextValue);
              const isNumbered = isNumberedList(editingTextValue);
              if (isBullet || isNumbered) {
                e.preventDefault();
                const textarea = e.target as HTMLTextAreaElement;
                const value = editingTextValue;
                const selectionStart = textarea.selectionStart;
                const selectionEnd = textarea.selectionEnd;
                // Find current line number
                const before = value.slice(0, selectionStart);
                const after = value.slice(selectionEnd);
                const lines = before.split('\n');
                const currentLine = lines[lines.length - 1];
                let prefix = '';
                if (isBullet) {
                  prefix = '• ';
                } else if (isNumbered) {
                  // Find the number for the new line
                  const match = currentLine.match(/^(\d+)\./);
                  let nextNum = 1;
                  if (match) {
                    nextNum = parseInt(match[1], 10) + 1;
                  } else {
                    // Fallback: count lines before
                    nextNum = lines.length;
                  }
                  prefix = `${nextNum}. `;
                }
                const insert = `\n${prefix}`;
                const newValue = value.slice(0, selectionStart) + insert + value.slice(selectionEnd);
                setEditingTextValue && setEditingTextValue(newValue);
                // Move cursor after the prefix
                setTimeout(() => {
                  textarea.selectionStart = textarea.selectionEnd = selectionStart + insert.length;
                }, 0);
                return;
              }
              // Default: finish editing
              e.preventDefault();
              if (handleTextEdit) handleTextEdit(el.id, editingTextValue);
              if (setEditingTextId) setEditingTextId(null);
            } else if (e.key === 'Escape') {
              if (setEditingTextId) setEditingTextId(null);
            }
          }}
        />
      );
    }
  }

  return (
    <div
      style={{
        width: displayWidth,
        height: displayHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        minWidth: scaledWidth,
        minHeight: scaledHeight,
        marginTop: 48,
        position: 'relative', // for absolute textarea
        ...style,
      }}
    >
      <div style={{
        width: scaledWidth,
        height: scaledHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          scale={{ x: scale, y: scale }}
          style={{
            background: backgroundColor || '#fff',
            borderRadius: 12,
            width: scaledWidth,
            height: scaledHeight,
            boxSizing: 'border-box',
            display: 'block',
          }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          <Layer>
            {/* Draw border around the flyer area */}
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              stroke="#1976d2"
              strokeWidth={3}
              cornerRadius={12}
              fill={backgroundColor}
              listening={false}
            />
            {/* Render flyer elements */}
            {flyer.elements.map((el: any) => {
              if (el.type === 'image') {
                const img = images[el.image];
                const isSelected = selectedId === el.id && !isGuest && !lockedElements.includes(el.id);
                const isCropResizeActive = cropResizeId === el.id;
                return (
                  <Group
                    key={el.id}
                    name={`image-group-${el.id}`}
                    ref={isCropResizeActive ? selectedShapeRef : undefined}
                    x={el.x}
                    y={el.y}
                    rotation={el.rotation}
                    draggable={!isGuest && !lockedElements.includes(el.id)}
                    onClick={() => { if (isGuest) return; onSelect(el.id); }}
                    onTap={() => { if (isGuest) return; onSelect(el.id); }}
                    onDragEnd={e => { if (isGuest) return; onTransform(el.id, { x: e.target.x(), y: e.target.y() }); }}
                    onTransformEnd={e => {
                      if (isGuest) return;
                      const node = e.target;
                      const scaleX = node.scaleX();
                      const scaleY = node.scaleY();

                      // Fallback to element's width/height if node's width/height is 0
                      let baseWidth = node.width();
                      let baseHeight = node.height();
                      if (!baseWidth || baseWidth <= 0) baseWidth = el.width || 180;
                      if (!baseHeight || baseHeight <= 0) baseHeight = el.height || 120;

                      const newWidth = Math.max(5, baseWidth * scaleX);
                      const newHeight = Math.max(5, baseHeight * scaleY);

                      console.log('TransformEnd:', {
                        x: node.x(),
                        y: node.y(),
                        width: baseWidth,
                        height: baseHeight,
                        scaleX,
                        scaleY,
                        newWidth,
                        newHeight,
                      });

                      onTransform(el.id, {
                        x: node.x(),
                        y: node.y(),
                        width: newWidth,
                        height: newHeight,
                        rotation: node.rotation(),
                        scaleX: 1,
                        scaleY: 1,
                      });

                      node.scaleX(1);
                      node.scaleY(1);
                    }}
                  >
                    <KonvaImage
                      image={img}
                      width={el.width}
                      height={el.height}
                      scaleX={el.scaleX ?? 1}
                      scaleY={el.scaleY ?? 1}
                    />
                  </Group>
                );
              }
              if (el.type === 'text') {
                return (
                  <CanvasTextElement
                    key={el.id}
                    el={el}
                    isSelected={selectedId === el.id}
                    isEditing={editingTextId === el.id}
                    onSelect={onSelect}
                    onTransform={onTransform}
                    setEditingTextId={setEditingTextId}
                    isGuest={isGuest}
                      />
                );
              }
              return null;
            })}
            {/* Single Transformer for selected image */}
            {flyer.elements.some((el: any) => el.type === 'image' && cropResizeId === el.id) && (
              <Transformer
                ref={transformerRef}
                rotateEnabled={true}
                enabledAnchors={["top-left","top-right","bottom-left","bottom-right"]}
                anchorSize={16}
                borderStrokeWidth={2}
                borderStroke="#1976d2"
                borderDash={[4, 2]}
                anchorCornerRadius={8}
              />
            )}
          </Layer>
        </Stage>
        {editingTextarea}
      </div>
    </div>
  );
};

export default ScaledCanvas;