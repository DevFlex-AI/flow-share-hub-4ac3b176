
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Document, Page, pdfjs, PDFDocumentProxy } from "react-pdf";
import { toast } from "sonner";
import TextEditor from "./TextEditor";
import PDFAnnotation from "./PDFAnnotation";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface TextEdit {
  id: string;
  text: string;
  position: { x: number; y: number };
  style: React.CSSProperties;
  pageNumber: number;
}

interface Annotation {
  id: string;
  type: "highlight" | "drawing" | "comment";
  content: string;
  position: { x: number; y: number };
  dimensions?: { width: number; height: number };
  pageNumber: number;
  style?: React.CSSProperties;
}

interface PDFViewerProps {
  file: File | null;
  activeTool: string;
  scale: number;
}

export interface PDFViewerRef {
  savePdf: () => Promise<Uint8Array | null>;
}

const PDFViewer = forwardRef<PDFViewerRef, PDFViewerProps>(({ file, activeTool, scale }, ref) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [textEdits, setTextEdits] = useState<TextEdit[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [textEditorPosition, setTextEditorPosition] = useState<{ x: number; y: number } | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [editingStyle, setEditingStyle] = useState<React.CSSProperties>({});
  const [pageDetails, setPageDetails] = useState<{width: number, height: number}[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfWrapperRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = async (pdf: PDFDocumentProxy) => {
    setNumPages(pdf.numPages);
    const details = [];
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        details.push({ width: viewport.width, height: viewport.height });
    }
    setPageDetails(details);
    toast.success(`Document loaded with ${pdf.numPages} pages`);
  };

  useImperativeHandle(ref, () => ({
    savePdf: async () => {
      if (!file || pageDetails.length === 0) return null;

      try {
        const pdfBytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        for (const edit of textEdits) {
          const pageIndex = edit.pageNumber - 1;
          if (pageIndex >= 0 && pageIndex < pages.length) {
            const page = pages[pageIndex];
            const pageDetail = pageDetails[pageIndex];
            
            const fontSize = parseInt(edit.style.fontSize as string, 10) || 16;
            const x = edit.position.x / scale;
            const y = pageDetail.height - (edit.position.y / scale) - (fontSize * 0.75); // Approximation for baseline
            
            const colorString = (edit.style.color as string) || '#000000';
            const r = parseInt(colorString.slice(1, 3), 16) / 255;
            const g = parseInt(colorString.slice(3, 5), 16) / 255;
            const b = parseInt(colorString.slice(5, 7), 16) / 255;

            page.drawText(edit.text, {
              x,
              y,
              font: edit.style.fontWeight === 'bold' ? helveticaBoldFont : helveticaFont,
              size: fontSize,
              color: rgb(r, g, b),
            });
          }
        }
        return await pdfDoc.save();
      } catch (error) {
        console.error("Error saving PDF:", error);
        toast.error("Failed to save PDF with edits.");
        return null;
      }
    }
  }));

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === "text" && !editingTextId) {
      const wrapperRect = pdfWrapperRef.current?.getBoundingClientRect();
      if (wrapperRect) {
        const x = e.clientX - wrapperRect.left;
        const y = e.clientY - wrapperRect.top;
        setTextEditorPosition({ x, y });
        setEditingText("");
        setEditingStyle({});
      }
    }
  };

  const handleTextSave = (text: string, style: React.CSSProperties) => {
    if (editingTextId) {
      // Update existing text edit
      setTextEdits(prev => 
        prev.map(edit => 
          edit.id === editingTextId 
            ? { ...edit, text, style } 
            : edit
        )
      );
    } else if (textEditorPosition) {
      // Add new text edit
      const newTextEdit: TextEdit = {
        id: `text-${Date.now()}`,
        text,
        position: textEditorPosition,
        style,
        pageNumber: currentPage
      };
      setTextEdits(prev => [...prev, newTextEdit]);
    }
    
    setTextEditorPosition(null);
    setEditingTextId(null);
  };

  const handleTextEditCancel = () => {
    setTextEditorPosition(null);
    setEditingTextId(null);
  };

  const handleTextEditClick = (id: string, text: string, style: React.CSSProperties, position: { x: number; y: number }) => {
    if (activeTool === "select" || activeTool === "text") {
      setEditingTextId(id);
      setEditingText(text);
      setEditingStyle(style);
      setTextEditorPosition(position);
    }
  };

  const handleDeleteTextEdit = (id: string) => {
    setTextEdits(prev => prev.filter(edit => edit.id !== id));
    toast.success("Text edit deleted");
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, numPages));
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg w-full overflow-auto" ref={containerRef}>
      {file ? (
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full mb-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:text-gray-500"
            >
              Previous
            </button>
            <span className="text-lg">
              Page {currentPage} of {numPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:text-gray-500"
            >
              Next
            </button>
          </div>

          <div 
            className="relative pdf-container bg-white shadow-lg" 
            style={{ width: `${scale * 100}%` }}
            ref={pdfWrapperRef}
            onClick={handlePageClick}
          >
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={() => toast.error("Error loading document")}
            >
              <Page 
                pageNumber={currentPage} 
                renderTextLayer={true}
                renderAnnotationLayer={true}
                scale={scale}
              />
            </Document>

            {/* Render Text Edits for current page */}
            {textEdits
              .filter(edit => edit.pageNumber === currentPage)
              .map(edit => (
                editingTextId === edit.id ? null : (
                  <div
                    key={edit.id}
                    className="absolute cursor-pointer text-edit-box"
                    style={{
                      left: `${edit.position.x}px`,
                      top: `${edit.position.y}px`,
                      ...edit.style
                    }}
                    onClick={() => handleTextEditClick(edit.id, edit.text, edit.style, edit.position)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleDeleteTextEdit(edit.id);
                    }}
                  >
                    {edit.text}
                  </div>
                )
              ))}

            {/* Render Annotations for current page */}
            {annotations
              .filter(annotation => annotation.pageNumber === currentPage)
              .map(annotation => (
                <PDFAnnotation
                  key={annotation.id}
                  annotation={annotation}
                  onDelete={() => {
                    setAnnotations(prev => prev.filter(a => a.id !== annotation.id));
                  }}
                />
              ))}

            {/* Text Editor */}
            {textEditorPosition && (
              <TextEditor
                position={textEditorPosition}
                onSave={handleTextSave}
                onCancel={handleTextEditCancel}
                initialText={editingText}
                initialStyle={editingStyle}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-xl text-gray-500 dark:text-gray-400">
            No PDF selected. Please upload a PDF file.
          </p>
        </div>
      )}
    </div>
  );
});

export default PDFViewer;
