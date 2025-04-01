
import React, { useCallback, useState } from 'react';
import { FileWithPath } from '@/types';
import { Button } from '@/components/ui/button';
import { parsePDF } from '@/utils/pdfParser';
import { savePDFDocument } from '@/utils/localStorage';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

interface PDFUploaderProps {
  onUploadComplete: () => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    try {
      setIsUploading(true);
      const parsedDocument = await parsePDF(file);
      savePDFDocument(parsedDocument);
      toast.success(`Successfully uploaded ${file.name}`);
      onUploadComplete();
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error('Failed to upload PDF. Please try again.');
    } finally {
      setIsUploading(false);
      event.target.value = ''; // Reset the input
    }
  };

  const onDrop = useCallback(async (acceptedFiles: FileWithPath[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    try {
      setIsUploading(true);
      const parsedDocument = await parsePDF(file);
      savePDFDocument(parsedDocument);
      toast.success(`Successfully uploaded ${file.name}`);
      onUploadComplete();
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error('Failed to upload PDF. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadComplete]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-center w-full">
        <label htmlFor="pdf-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary/80 border-primary/20">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 mb-3 text-primary" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">PDF files only</p>
            {isUploading && (
              <div className="mt-4 flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </div>
            )}
          </div>
          <input 
            id="pdf-upload" 
            type="file" 
            className="hidden" 
            accept=".pdf" 
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
};

export default PDFUploader;
