
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PDFDocument, RelatedDocument } from '@/types';
import { getRelatedDocuments } from '@/utils/pdfParser';
import { Loader2, FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface RelatedDocumentsProps {
  documentId: string;
  allDocuments: PDFDocument[];
  onSelectDocument: (documentId: string) => void;
}

const RelatedDocuments: React.FC<RelatedDocumentsProps> = ({ 
  documentId, 
  allDocuments,
  onSelectDocument 
}) => {
  const [relatedDocs, setRelatedDocs] = useState<RelatedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const findRelatedDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await getRelatedDocuments(documentId, allDocuments);
      setRelatedDocs(docs);
      if (docs.length === 0) {
        toast.info('No related documents found');
      }
    } catch (error) {
      console.error('Error finding related documents:', error);
      toast.error('Failed to find related documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Reset when document changes
    setRelatedDocs([]);
  }, [documentId]);

  return (
    <Card className="w-full bg-white dark:bg-slate-800 border-0 shadow-md rounded-xl overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700">
        <CardTitle className="text-lg flex justify-between items-center">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
            <span>Related Documents</span>
          </div>
          {relatedDocs.length === 0 && !isLoading && (
            <Button 
              size="sm" 
              onClick={findRelatedDocuments}
              variant="outline"
              className="bg-white hover:bg-purple-50 text-purple-600 border-purple-200"
            >
              Find Related
            </Button>
          )}
          {isLoading && (
            <Button size="sm" variant="outline" disabled className="bg-purple-50">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {relatedDocs.length > 0 ? (
          <div className="space-y-2">
            {relatedDocs.map((doc) => (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2" />
                  <span className="text-sm font-medium">{doc.name}</span>
                  <div className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                    {Math.round(doc.similarity * 100)}% similar
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onSelectDocument(doc.id)}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400"
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
            {isLoading 
              ? 'Analyzing documents to find related content...' 
              : 'Find documents with similar content to the current document.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RelatedDocuments;
