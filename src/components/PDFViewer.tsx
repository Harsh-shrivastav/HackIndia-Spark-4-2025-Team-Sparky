
import React, { useState } from 'react';
import { PDFDocument } from '@/types';
import { Button } from '@/components/ui/button';
import { deletePDFDocument } from '@/utils/localStorage';
import { Trash2, FileText, Text, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

interface PDFViewerProps {
  document: PDFDocument;
  onDelete: () => void;
  onSelectText: (text: string) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ document, onDelete, onSelectText }) => {
  const [selectedText, setSelectedText] = useState<string>('');

  const handleDelete = () => {
    deletePDFDocument(document.id);
    toast.success('Document deleted');
    onDelete();
  };

  const handleTextSelection = () => {
    const selection = window.getSelection()?.toString();
    if (selection) {
      setSelectedText(selection);
    }
  };

  const handleUseSelectedText = () => {
    if (selectedText) {
      onSelectText(selectedText);
      toast.success('Text selected for slide generation');
    } else {
      toast.error('Please select text first');
    }
  };

  const handleCopyText = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
      toast.success('Text copied to clipboard');
    } else {
      toast.error('Please select text first');
    }
  };

  // Format paragraphs for better readability
  const formatContent = () => {
    return document.content.split('\n\n').map((paragraph, index) => {
      // Check if paragraph is a heading (uppercase with fewer words)
      const isHeading = paragraph.toUpperCase() === paragraph && paragraph.split(' ').length < 8;
      
      // Check if paragraph is a list item
      const isList = paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-') || /^\d+[\.\)]/.test(paragraph.trim());
      
      if (isHeading) {
        return (
          <h3 key={index} className="text-xl font-semibold mt-8 mb-4 text-primary">
            {paragraph}
          </h3>
        );
      }
      
      if (isList) {
        return (
          <li key={index} className="ml-5 mb-3 list-disc">
            {paragraph}
          </li>
        );
      }
      
      return (
        <p key={index} className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-xl bg-card animate-fade-in border border-border">
      <div className="header-gradient px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-white mr-2" />
          <h3 className="font-semibold truncate text-white">{document.name}</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 text-white">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDelete} className="bg-red-500/80 hover:bg-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        className="pdf-viewer" 
        onMouseUp={handleTextSelection}
      >
        <div className="document-content">
          {formatContent()}
        </div>
      </div>
      
      <div className="p-4 bg-card border-t">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Text className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm text-muted-foreground">
              {selectedText ? 'Text selected' : 'Select text to create slides'}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={handleCopyText} 
              disabled={!selectedText}
              size="sm"
              variant="outline"
              className="gap-1"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
            <Button 
              onClick={handleUseSelectedText} 
              disabled={!selectedText}
              size="sm"
              className="bg-accent hover:bg-accent/90"
            >
              Use Selected Text
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
