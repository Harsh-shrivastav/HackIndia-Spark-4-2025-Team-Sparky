
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PDFDocument, DocumentSummary } from '@/types';
import { summarizeDocument } from '@/utils/pdfParser';
import { Loader2, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentSummaryProps {
  document: PDFDocument;
}

const DocumentSummaryComponent: React.FC<DocumentSummaryProps> = ({ document }) => {
  const [summary, setSummary] = useState<DocumentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateSummary = async () => {
    try {
      setIsLoading(true);
      const newSummary = await summarizeDocument(document);
      setSummary(newSummary);
      toast.success('Summary generated successfully');
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  const exportSummary = () => {
    if (!summary) return;

    const blob = new Blob([summary.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.name.replace('.pdf', '')}_summary.txt`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Summary exported successfully');
  };

  return (
    <Card className="w-full bg-white dark:bg-slate-800 border-0 shadow-md rounded-xl overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
        <CardTitle className="text-lg flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            <span>Document Summary</span>
          </div>
          {!summary && !isLoading && (
            <Button 
              size="sm" 
              onClick={generateSummary}
              variant="outline"
              className="bg-white hover:bg-blue-50 text-blue-600 border-blue-200"
            >
              Generate
            </Button>
          )}
          {summary && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={exportSummary}
              className="bg-white hover:bg-blue-50 text-blue-600 border-blue-200"
            >
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          )}
          {isLoading && (
            <Button size="sm" variant="outline" disabled className="bg-blue-50">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {summary ? (
          <div className="text-sm whitespace-pre-wrap bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-100 dark:border-slate-700 leading-relaxed">
            {summary.content}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
            {isLoading 
              ? 'Analyzing document and generating summary...' 
              : 'Generate a summary to get key insights from this document.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentSummaryComponent;
