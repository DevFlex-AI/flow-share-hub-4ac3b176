
import React from "react";
import { X } from "lucide-react";

interface AnnotationProps {
  annotation: {
    id: string;
    type: "highlight" | "drawing" | "comment";
    content: string;
    position: { x: number; y: number };
    dimensions?: { width: number; height: number };
    style?: React.CSSProperties;
  };
  onDelete: () => void;
}

const PDFAnnotation: React.FC<AnnotationProps> = ({ annotation, onDelete }) => {
  const { type, content, position, dimensions, style } = annotation;
  
  const getClassName = () => {
    let className = "pdf-annotation";
    if (type) {
      className += ` ${type}`;
    }
    return className;
  };
  
  return (
    <div
      className={getClassName()}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: dimensions?.width ? `${dimensions.width}px` : "auto",
        height: dimensions?.height ? `${dimensions.height}px` : "auto",
        ...style
      }}
    >
      {content}
      <div className="annotation-controls">
        <button 
          onClick={onDelete}
          className="p-1 hover:bg-red-100"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

export default PDFAnnotation;
