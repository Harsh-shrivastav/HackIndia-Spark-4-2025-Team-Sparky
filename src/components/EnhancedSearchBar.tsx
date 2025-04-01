
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { SearchIcon, Loader2, Sparkles, Mic } from 'lucide-react';
import { enhancedSearch } from '@/utils/geminiService';
import { PDFDocument, SearchResult } from '@/types';

interface EnhancedSearchBarProps {
  documents: PDFDocument[];
  onResults: (results: SearchResult[]) => void;
}

const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({ 
  documents,
  onResults
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    try {
      setIsSearching(true);
      const results = await enhancedSearch(query, documents);
      onResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex w-full space-x-3 items-center relative glass-card p-2 animate-fade-in">
      <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-foreground">
        <SearchIcon className="h-5 w-5" />
      </div>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about your documents..."
        className="flex-1 pl-12 pr-4 py-2 h-14 rounded-xl border-0 bg-transparent focus:ring-0 text-base"
      />
      <div className="flex space-x-2">
        <Button
          variant="outline"
          className="h-10 w-10 rounded-full p-0 border border-input bg-background hover:bg-muted"
        >
          <Mic className="h-4 w-4 text-muted-foreground" />
        </Button>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !query.trim()}
                className="h-10 px-5 bg-accent hover:bg-accent/90 text-white rounded-full flex items-center gap-2 action-button"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>AI Search</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-accent text-white p-2 border-0">
              <p>Search across all your documents using AI</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default EnhancedSearchBar;
