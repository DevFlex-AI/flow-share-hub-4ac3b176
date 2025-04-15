
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PDFPropertiesProps {
  file: File | null;
}

interface PDFMetadata {
  fileName: string;
  fileSize: string;
  dateCreated: string;
  dateModified: string;
  pageCount: string;
}

const PDFProperties: React.FC<PDFPropertiesProps> = ({ file }) => {
  const [metadata, setMetadata] = useState<PDFMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (file) {
      setLoading(true);
      
      // In a real application, we would extract actual PDF metadata
      // Here we're using a simulated approach
      setTimeout(() => {
        const fileSize = formatFileSize(file.size);
        const dateModified = new Date(file.lastModified).toLocaleString();
        
        setMetadata({
          fileName: file.name,
          fileSize,
          dateCreated: new Date().toLocaleString(), // This would come from PDF metadata
          dateModified,
          pageCount: "Unknown", // This would come from PDF metadata
        });
        
        setLoading(false);
      }, 1000);
    } else {
      setMetadata(null);
    }
  }, [file]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!file) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Properties</CardTitle>
          <CardDescription>No document loaded</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Upload a PDF file to view its properties.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Properties</CardTitle>
        <CardDescription>Information about the PDF document</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </>
        ) : metadata ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium">File Name</h3>
              <p className="text-sm text-muted-foreground">{metadata.fileName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">File Size</h3>
              <p className="text-sm text-muted-foreground">{metadata.fileSize}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Created</h3>
              <p className="text-sm text-muted-foreground">{metadata.dateCreated}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Modified</h3>
              <p className="text-sm text-muted-foreground">{metadata.dateModified}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Pages</h3>
              <p className="text-sm text-muted-foreground">{metadata.pageCount}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Error loading document properties.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFProperties;
