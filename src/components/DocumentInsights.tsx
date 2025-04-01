
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Loader2, Sparkles, Download } from 'lucide-react';
import { PDFDocument } from '@/types';
import { generateDocumentInsights } from '@/utils/geminiService';
import { toast } from 'sonner';

interface DocumentInsightsProps {
  document: PDFDocument;
}

const DocumentInsights: React.FC<DocumentInsightsProps> = ({ document }) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const generatedInsights = await generateDocumentInsights(document);
      setInsights(generatedInsights);
      toast.success('Insights generated successfully');
    } catch (err) {
      console.error('Error getting insights:', err);
      setError('Failed to generate insights. Please try again.');
      toast.error('Failed to generate insights');
    } finally {
      setIsLoading(false);
    }
  };

  const exportInsights = () => {
    if (insights.length === 0) return;
    
    const insightsText = insights.join('\n\n• ');
    const content = `Document Insights for ${document.name}\n\n• ${insightsText}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.name.replace('.pdf', '')}_insights.txt`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Insights exported successfully');
  };

  return (
    <Card className="w-full bg-white dark:bg-slate-800 border-0 shadow-md rounded-xl overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-slate-800 dark:to-slate-700">
        <CardTitle className="text-lg flex justify-between items-center">
          <div className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
            <span>Document Insights</span>
          </div>
          {insights.length > 0 && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={exportInsights}
              className="bg-white hover:bg-amber-50 text-amber-600 border-amber-200"
            >
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div 
                key={index} 
                className="p-3 rounded-lg border border-amber-100 dark:border-amber-900/30 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 text-sm relative overflow-hidden group hover-scale"
              >
                <Sparkles className="absolute right-2 top-2 h-4 w-4 text-amber-400/30 group-hover:text-amber-400/50 transition-colors" />
                <p className="pr-6">{insight}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-10 w-10 animate-spin text-amber-500 mb-4" />
                <p className="text-sm text-muted-foreground">
                  AI is analyzing your document...
                </p>
              </div>
            ) : (
              <>
                {error ? (
                  <div className="text-center">
                    <p className="text-sm text-destructive mb-3">{error}</p>
                    <Button onClick={fetchInsights} variant="outline" className="border-amber-200 text-amber-700">
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Lightbulb className="h-12 w-12 text-amber-300 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate AI-powered insights from this document
                    </p>
                    <Button onClick={fetchInsights} className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 border-0">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Insights
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentInsights;
