
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchResult } from '@/types';
import { FileText } from 'lucide-react';

interface SearchResultsProps {
  results: SearchResult[];
  onSelectDocument: (documentId: string) => void;
  onSelectText: (text: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  onSelectDocument,
  onSelectText
}) => {
  if (results.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          Search Results ({results.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={`${result.documentId}-${index}`} className="border-b pb-3 last:border-b-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-primary mr-2" />
                  <span className="font-medium">{result.documentName}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Relevance: {Math.round(result.relevanceScore * 100)}%
                </div>
              </div>
              <p className="text-sm my-2 whitespace-pre-wrap">{result.snippet}</p>
              <div className="flex space-x-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onSelectDocument(result.documentId)}
                >
                  View Document
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onSelectText(result.snippet)}
                >
                  Use for Slides
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchResults;
