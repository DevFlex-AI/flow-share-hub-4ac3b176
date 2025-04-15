
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { APIKeyManager } from "@/components/APIKeyManager";
import { getOpenAIKey } from "@/utils/apiKeys";

interface PDFConverterProps {
  file: File | null;
  onClose: () => void;
}

const fileFormats = [
  { id: "docx", name: "Word Document (.docx)" },
  { id: "html", name: "HTML (.html)" },
  { id: "png", name: "PNG Image (.png)" },
  { id: "jpg", name: "JPEG Image (.jpg)" },
  { id: "txt", name: "Text (.txt)" },
];

const PDFConverter: React.FC<PDFConverterProps> = ({ file, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [showApiKeyManager, setShowApiKeyManager] = useState<boolean>(false);

  const handleConvert = async () => {
    if (!file) {
      toast.error("No PDF file selected");
      return;
    }

    if (!selectedFormat) {
      toast.error("Please select a format to convert to");
      return;
    }

    // Check if OpenAI API key is available
    if (selectedFormat === "txt" && !getOpenAIKey()) {
      setShowApiKeyManager(true);
      return;
    }

    setIsConverting(true);

    // Simulate conversion process
    setTimeout(() => {
      setIsConverting(false);
      
      // In a real app, we would:
      // 1. Upload the PDF to a server
      // 2. Use a conversion library or API
      // 3. Return the converted file for download
      
      toast.success(`PDF converted to ${selectedFormat}`);
      
      // Simulate download
      const fakeDownloadName = file.name.replace(".pdf", `.${selectedFormat}`);
      toast.info(`Simulated download of ${fakeDownloadName}`);
      
      onClose();
    }, 2000);
  };

  if (showApiKeyManager) {
    return (
      <Dialog open={true} onOpenChange={() => setShowApiKeyManager(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>OpenAI API Key Required</DialogTitle>
            <DialogDescription>
              Text extraction features require an OpenAI API key.
            </DialogDescription>
          </DialogHeader>
          <APIKeyManager />
          <DialogFooter>
            <Button onClick={() => setShowApiKeyManager(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert PDF</DialogTitle>
          <DialogDescription>
            Choose a format to convert your PDF file into
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file-name">PDF File</Label>
            <p className="text-sm font-medium">
              {file ? file.name : "No file selected"}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="format">Convert to</Label>
            <Select 
              value={selectedFormat} 
              onValueChange={setSelectedFormat}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {fileFormats.map(format => (
                  <SelectItem key={format.id} value={format.id}>
                    {format.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isConverting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConvert}
            disabled={!selectedFormat || isConverting || !file}
          >
            {isConverting ? "Converting..." : "Convert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PDFConverter;
