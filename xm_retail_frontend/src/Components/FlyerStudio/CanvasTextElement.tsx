import React from 'react';
import { Group, Rect, Text as KonvaText } from 'react-konva';

interface CanvasTextElementProps {
  el: any;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (id: string) => void;
  onTransform: (id: string, newAttrs: any) => void;
  setEditingTextId: (id: string | null) => void;
  isGuest: boolean;
}

const CanvasTextElement: React.FC<CanvasTextElementProps> = ({
  el, isSelected, isEditing, onSelect, onTransform, setEditingTextId, isGuest
}) => {
  const textRef = React.useRef<any>(null);
  const [textDims, setTextDims] = React.useState<{width: number, height: number}>({width: el.width || 200, height: el.fontSize ? el.fontSize * 1.2 : 20});
  React.useEffect(() => {
    if (textRef.current) {
      setTextDims({
        width: textRef.current.width(),
        height: textRef.current.height(),
      });
    }
  }, [el.text, el.fontSize, el.fontFamily, el.fontWeight, el.fontStyle, el.width]);
  return (
    <Group
      x={el.x}
      y={el.y}
      rotation={el.rotation}
      draggable={!isGuest}
      onClick={() => { if (isGuest) return; onSelect(el.id); }}
      onTap={() => { if (isGuest) return; onSelect(el.id); }}
      onDragEnd={e => { if (isGuest) return; onTransform(el.id, { x: e.target.x(), y: e.target.y() }); }}
      onDblClick={() => { if (isGuest) return; setEditingTextId(el.id); }}
      onTransformEnd={e => {
        if (isGuest) return;
        const node = e.target;
        onTransform(el.id, {
          x: node.x(),
          y: node.y(),
          width: node.width() * node.scaleX(),
          fontSize: el.fontSize * node.scaleY(),
          rotation: node.rotation(),
        });
        node.scaleX(1);
        node.scaleY(1);
      }}
    >
      {isSelected && !isEditing && (
        <Rect
          x={0}
          y={0}
          width={textDims.width}
          height={textDims.height}
          stroke="#1976d2"
          strokeWidth={2}
          cornerRadius={6}
          dash={[6, 4]}
          listening={false}
        />
      )}
      {!isEditing && (
        <KonvaText
          ref={textRef}
          text={el.text}
          fontSize={el.fontSize}
          fill={el.fill}
          width={el.width && el.width > 20 ? el.width : 200}
          fontStyle={el.fontStyle}
          fontWeight={el.fontWeight}
          textDecoration={el.textDecoration}
          fontFamily={el.fontFamily}
          align={el.textAlign}
          lineHeight={el.lineHeight}
          letterSpacing={el.letterSpacing}
        />
      )}
    </Group>
  );
};
//comments
export default CanvasTextElement;
 