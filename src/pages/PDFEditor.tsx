
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  FileText, Type, MousePointer, Highlighter, PenTool, MessageSquare, 
  RotateCw, Trash2, FilePlus, ChevronDown, Download, FileOutput
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import PDFViewer from "@/components/PDFEditor/PDFViewer";
import PDFConverter from "@/components/PDFEditor/PDFConverter";
import PDFProperties from "@/components/PDFEditor/PDFProperties";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/pdf-editor.css";

const PDFEditor: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [activeTool, setActiveTool] = useState<string>("select");
  const [scale, setScale] = useState<number>(1);
  const [showConverter, setShowConverter] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Check if user is logged in
  React.useEffect(() => {
    if (!currentUser) {
      toast.error("Please log in to use the PDF Editor");
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setPdfFile(file);
      } else {
        toast.error("Please select a PDF file");
      }
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleDeletePage = () => {
    toast.info("Page deletion not implemented in this demo");
  };

  const handleRotatePage = () => {
    toast.info("Page rotation not implemented in this demo");
  };

  const handleAddPage = () => {
    toast.info("Page addition not implemented in this demo");
  };

  const handleDownload = () => {
    if (pdfFile) {
      const url = URL.createObjectURL(pdfFile);
      const a = document.createElement("a");
      a.href = url;
      a.download = pdfFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      toast.error("No PDF to download");
    }
  };

  const handleConvertClick = () => {
    setShowConverter(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
          <h1 className="text-xl font-semibold">PDF-Edits</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={() => fileInputRef.current?.click()} size="sm">
            Open PDF
          </Button>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          {pdfFile && (
            <Button onClick={handleDownload} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Save
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Tools Sidebar */}
        <div className="w-16 bg-white dark:bg-gray-800 shadow-sm flex flex-col items-center py-4 border-r">
          <Button
            variant={activeTool === "select" ? "default" : "ghost"}
            size="icon"
            onClick={() => setActiveTool("select")}
            className="mb-2"
          >
            <MousePointer className="h-5 w-5" />
          </Button>
          
          <Button
            variant={activeTool === "text" ? "default" : "ghost"}
            size="icon"
            onClick={() => setActiveTool("text")}
            className="mb-2"
          >
            <Type className="h-5 w-5" />
          </Button>
          
          <Button
            variant={activeTool === "highlight" ? "default" : "ghost"}
            size="icon"
            onClick={() => setActiveTool("highlight")}
            className="mb-2"
          >
            <Highlighter className="h-5 w-5" />
          </Button>
          
          <Button
            variant={activeTool === "draw" ? "default" : "ghost"}
            size="icon"
            onClick={() => setActiveTool("draw")}
            className="mb-2"
          >
            <PenTool className="h-5 w-5" />
          </Button>
          
          <Button
            variant={activeTool === "comment" ? "default" : "ghost"}
            size="icon"
            onClick={() => setActiveTool("comment")}
            className="mb-2"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          
          <div className="flex-1"></div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="mb-2">
                <ChevronDown className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right">
              <DropdownMenuItem onClick={handleZoomIn}>
                Zoom In
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleZoomOut}>
                Zoom Out
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRotatePage}>
                <RotateCw className="h-4 w-4 mr-2" />
                Rotate Page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeletePage}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddPage}>
                <FilePlus className="h-4 w-4 mr-2" />
                Add Page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleConvertClick}>
                <FileOutput className="h-4 w-4 mr-2" />
                Convert PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="viewer" className="h-full flex flex-col">
            <div className="border-b px-4">
              <TabsList>
                <TabsTrigger value="viewer">PDF Viewer</TabsTrigger>
                <TabsTrigger value="properties">Document Properties</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="viewer" className="flex-1 overflow-auto p-4">
              <PDFViewer
                file={pdfFile}
                activeTool={activeTool}
                scale={scale}
              />
            </TabsContent>
            
            <TabsContent value="properties" className="p-4">
              <PDFProperties file={pdfFile} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {showConverter && (
        <PDFConverter 
          file={pdfFile} 
          onClose={() => setShowConverter(false)} 
        />
      )}
    </div>
  );
};

export default PDFEditor;
