import React from 'react';
import './ResizeHandles.css';

interface ResizeHandlesProps {
  isSelected: boolean;
  onResizeStart: (e: React.MouseEvent, direction: ResizeDirection) => void;
}

export type ResizeDirection = 
  | 'n' | 's' | 'e' | 'w' 
  | 'ne' | 'nw' | 'se' | 'sw';

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  isSelected,
  onResizeStart,
}) => {
  if (!isSelected) return null;

  const handleMouseDown = (e: React.MouseEvent, direction: ResizeDirection) => {
    e.stopPropagation();
    onResizeStart(e, direction);
  };

  return (
    <>
      {/* 四角 */}
      <div 
        className="resize-handle resize-handle-nw"
        onMouseDown={(e) => handleMouseDown(e, 'nw')}
        title="调整大小 ↖"
      />
      <div 
        className="resize-handle resize-handle-ne"
        onMouseDown={(e) => handleMouseDown(e, 'ne')}
        title="调整大小 ↗"
      />
      <div 
        className="resize-handle resize-handle-sw"
        onMouseDown={(e) => handleMouseDown(e, 'sw')}
        title="调整大小 ↙"
      />
      <div 
        className="resize-handle resize-handle-se"
        onMouseDown={(e) => handleMouseDown(e, 'se')}
        title="调整大小 ↘"
      />
      
      {/* 四边 */}
      <div 
        className="resize-handle resize-handle-n"
        onMouseDown={(e) => handleMouseDown(e, 'n')}
        title="调整高度 ↑"
      />
      <div 
        className="resize-handle resize-handle-s"
        onMouseDown={(e) => handleMouseDown(e, 's')}
        title="调整高度 ↓"
      />
      <div 
        className="resize-handle resize-handle-e"
        onMouseDown={(e) => handleMouseDown(e, 'e')}
        title="调整宽度 →"
      />
      <div 
        className="resize-handle resize-handle-w"
        onMouseDown={(e) => handleMouseDown(e, 'w')}
        title="调整宽度 ←"
      />
    </>
  );
};
