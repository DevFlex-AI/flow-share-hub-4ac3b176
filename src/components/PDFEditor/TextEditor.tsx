
import React, { useState, useEffect, useRef } from "react";
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, 
  AlignRight, Type, PaintBucket 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "sonner";

interface TextEditorProps {
  position: { x: number; y: number };
  onSave: (text: string, style: React.CSSProperties) => void;
  onCancel: () => void;
  initialText?: string;
  initialStyle?: React.CSSProperties;
}

const TextEditor: React.FC<TextEditorProps> = ({ 
  position, onSave, onCancel, initialText = "", initialStyle = {} 
}) => {
  const [text, setText] = useState(initialText);
  const [style, setStyle] = useState<React.CSSProperties>({
    fontWeight: "normal",
    fontStyle: "normal",
    textDecoration: "none",
    textAlign: "left",
    color: "#000000",
    backgroundColor: "transparent",
    ...initialStyle
  });
  const editorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Auto-focus the editor when it appears
    if (editorRef.current) {
      editorRef.current.focus();
    }

    // Handle clicks outside the editor to save
    const handleClickOutside = (e: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [text, style]);

  const handleSave = () => {
    if (text.trim()) {
      onSave(text, style);
      toast.success("Text saved");
    } else {
      onCancel();
    }
  };

  const toggleStyle = (property: keyof React.CSSProperties, value: any, altValue: any) => {
    setStyle(prev => ({
      ...prev,
      [property]: prev[property] === value ? altValue : value
    }));
  };

  const handleTextAlign = (alignment: string) => {
    setStyle(prev => ({
      ...prev,
      textAlign: alignment
    }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStyle(prev => ({
      ...prev,
      color: e.target.value
    }));
  };

  const handleBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStyle(prev => ({
      ...prev,
      backgroundColor: e.target.value === "#ffffff" && style.backgroundColor === "transparent" 
        ? "transparent" 
        : e.target.value
    }));
  };

  return (
    <div 
      className="absolute z-10 flex flex-col" 
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        maxWidth: "400px" 
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-t-md p-1 flex flex-wrap gap-1 border border-gray-300 dark:border-gray-600">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleStyle("fontWeight", "bold", "normal")}
          className={`h-8 w-8 ${style.fontWeight === "bold" ? "bg-accent" : ""}`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleStyle("fontStyle", "italic", "normal")}
          className={`h-8 w-8 ${style.fontStyle === "italic" ? "bg-accent" : ""}`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleStyle("textDecoration", "underline", "none")}
          className={`h-8 w-8 ${style.textDecoration === "underline" ? "bg-accent" : ""}`}
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleTextAlign("left")}
          className={`h-8 w-8 ${style.textAlign === "left" ? "bg-accent" : ""}`}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleTextAlign("center")}
          className={`h-8 w-8 ${style.textAlign === "center" ? "bg-accent" : ""}`}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleTextAlign("right")}
          className={`h-8 w-8 ${style.textAlign === "right" ? "bg-accent" : ""}`}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Type className="h-4 w-4" style={{ color: style.color as string }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <input 
              type="color" 
              value={style.color as string} 
              onChange={handleColorChange}
              className="w-full h-8"
            />
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <PaintBucket className="h-4 w-4" style={{ color: style.backgroundColor === "transparent" ? "#ffffff" : style.backgroundColor as string }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <input 
              type="color" 
              value={style.backgroundColor === "transparent" ? "#ffffff" : style.backgroundColor as string} 
              onChange={handleBgColorChange}
              className="w-full h-8"
            />
            <div className="mt-2 flex items-center gap-2">
              <input 
                type="checkbox" 
                id="transparentBg" 
                checked={style.backgroundColor === "transparent"}
                onChange={(e) => setStyle(prev => ({
                  ...prev,
                  backgroundColor: e.target.checked ? "transparent" : "#ffffff"
                }))}
              />
              <label htmlFor="transparentBg" className="text-sm">Transparent background</label>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[40px] min-w-[100px] p-2 outline-none border border-gray-300 dark:border-gray-600 rounded-b-md"
        style={style}
        onInput={(e) => setText(e.currentTarget.textContent || "")}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
};

export default TextEditor;
