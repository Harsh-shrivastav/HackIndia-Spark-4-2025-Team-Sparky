
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PDFUploader from '@/components/PDFUploader';
import PDFViewer from '@/components/PDFViewer';
import SearchBar from '@/components/SearchBar';
import EnhancedSearchBar from '@/components/EnhancedSearchBar';
import SlideGenerator from '@/components/SlideGenerator';
import SlidePreview from '@/components/SlidePreview';
import SearchResults from '@/components/SearchResults';
import DocumentSummary from '@/components/DocumentSummary';
import RelatedDocuments from '@/components/RelatedDocuments';
import DocumentInsights from '@/components/DocumentInsights';
import AppSidebar from '@/components/AppSidebar';
import { PDFDocument, SearchResult, SlidePresentation } from '@/types';
import { getPDFDocuments, getSlidePresentations } from '@/utils/localStorage';
import { searchInPDF } from '@/utils/pdfParser';
import { FileText, Presentation, Search, Upload, Book, Lightbulb, Menu, X, FileIcon } from 'lucide-react';

const Index = () => {
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [presentations, setPresentations] = useState<SlidePresentation[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<PDFDocument | null>(null);
  const [selectedPresentation, setSelectedPresentation] = useState<SlidePresentation | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [enhancedResults, setEnhancedResults] = useState<SearchResult[]>([]);
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  useEffect(() => {
    loadDocuments();
    loadPresentations();
  }, []);

  const loadDocuments = () => {
    const docs = getPDFDocuments();
    setDocuments(docs);
  };

  const loadPresentations = () => {
    const pres = getSlidePresentations();
    setPresentations(pres);
  };

  const handleDocumentSelect = (doc: PDFDocument) => {
    setSelectedDocument(doc);
    setActiveTab('view');
    setSearchResults([]);
    setEnhancedResults([]);
  };

  const handlePresentationSelect = (pres: SlidePresentation) => {
    setSelectedPresentation(pres);
    setActiveTab('preview');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (selectedDocument && query) {
      const results = searchInPDF(selectedDocument, query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleEnhancedSearchResults = (results: SearchResult[]) => {
    setEnhancedResults(results);
  };

  const handleUploadComplete = () => {
    loadDocuments();
    setActiveTab('documents');
  };

  const handleSelectText = (text: string) => {
    setSelectedText(text);
    setActiveTab('generate');
  };

  const handleSlidesGenerated = (presentation: SlidePresentation) => {
    loadPresentations();
    setSelectedPresentation(presentation);
    setActiveTab('preview');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const renderDocumentList = () => {
    if (documents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-secondary/20 rounded-2xl">
          <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No documents yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Upload a PDF document to get started with our AI-powered document assistance
          </p>
          <Button 
            className="bg-accent hover:bg-accent/80 text-white px-8 py-6 h-auto text-base rounded-xl shadow-lg" 
            onClick={() => setActiveTab('upload')}
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload a PDF
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Search All Documents</h2>
          <EnhancedSearchBar 
            documents={documents}
            onResults={handleEnhancedSearchResults}
          />
        </div>
        
        {enhancedResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              AI Search Results
            </h2>
            <SearchResults 
              results={enhancedResults}
              onSelectDocument={(id) => {
                const doc = documents.find(d => d.id === id);
                if (doc) handleDocumentSelect(doc);
              }}
              onSelectText={handleSelectText}
            />
          </div>
        )}
        
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Your Documents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 staggered-fade-in">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                onClick={() => handleDocumentSelect(doc)}
                className="card-gradient border rounded-xl p-6 hover:border-accent cursor-pointer transition-all duration-300 shadow hover:shadow-lg hover:scale-[1.02]"
              >
                <div className="flex items-center mb-3">
                  <FileText className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-medium truncate">{doc.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {doc.content.substring(0, 150)}...
                </p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>
                    Added on {new Date(doc.dateAdded).toLocaleDateString()}
                  </span>
                  <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto">View</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {presentations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Presentation className="h-6 w-6 text-accent" />
              Your Presentations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {presentations.map((pres) => (
                <div 
                  key={pres.id}
                  onClick={() => handlePresentationSelect(pres)}
                  className="card-gradient border rounded-xl p-6 hover:border-accent cursor-pointer transition-all duration-300 shadow hover:shadow-lg hover:scale-[1.02]"
                >
                  <div className="flex items-center mb-3">
                    <Presentation className="h-5 w-5 text-accent mr-2" />
                    <h3 className="font-medium truncate">{pres.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {pres.slides.length} slides
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created on {new Date(pres.dateCreated).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar 
        collapsed={sidebarCollapsed} 
        toggleSidebar={toggleSidebar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasDocs={documents.length > 0}
        hasSelection={!!selectedText}
        hasPresentation={!!selectedPresentation}
      />
      
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="container max-w-7xl py-8 px-6">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden mr-4" 
                onClick={toggleSidebar}
              >
                {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
              </Button>
              
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  AI Document Assistant
                </h1>
                <p className="text-muted-foreground mt-1">
                  Transform your documents into insights and presentations
                </p>
              </div>
              
              <div className="hidden md:flex">
                <Button 
                  onClick={() => setActiveTab('upload')}
                  className="bg-accent hover:bg-accent/90 text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
            
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full mt-8 hidden md:block"
            >
              <TabsList className="grid grid-cols-5 mb-8 bg-secondary/50 p-1 rounded-xl">
                <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow">
                  <Upload className="h-4 w-4 mr-2" />
                  <span>Upload</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Documents</span>
                </TabsTrigger>
                <TabsTrigger value="view" disabled={!selectedDocument} className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow">
                  <Book className="h-4 w-4 mr-2" />
                  <span>View</span>
                </TabsTrigger>
                <TabsTrigger value="generate" disabled={!selectedText} className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow">
                  <Presentation className="h-4 w-4 mr-2" />
                  <span>Generate</span>
                </TabsTrigger>
                <TabsTrigger value="preview" disabled={!selectedPresentation} className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow">
                  <Search className="h-4 w-4 mr-2" />
                  <span>Preview</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </header>

          {/* IMPORTANT: All TabsContent components must be within the same Tabs context as their TabsTriggers */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="upload" className="border-none p-0 animate-slide-in">
              <div className="max-w-3xl mx-auto glass-card p-8 rounded-2xl shadow-xl">
                <PDFUploader onUploadComplete={handleUploadComplete} />
              </div>
            </TabsContent>

            <TabsContent value="documents" className="border-none p-0 animate-slide-in">
              {renderDocumentList()}
            </TabsContent>

            <TabsContent value="view" className="border-none p-0 animate-slide-in">
              {selectedDocument && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Book className="h-6 w-6 text-primary" />
                      {selectedDocument.name}
                    </h2>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('documents')}
                      className="rounded-xl"
                    >
                      Back to Documents
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <PDFViewer 
                        document={selectedDocument} 
                        onDelete={() => {
                          setSelectedDocument(null);
                          loadDocuments();
                          setActiveTab('documents');
                        }}
                        onSelectText={handleSelectText}
                      />
                    </div>
                    
                    <div className="space-y-6">
                      <div className="glass-card p-5 rounded-xl">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Search className="h-4 w-4 text-primary" />
                          Search Document
                        </h3>
                        <SearchBar onSearch={handleSearch} />
                        
                        {searchResults.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                              <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs">
                                {searchResults.length} results
                              </span>
                              <span>for "{searchQuery}"</span>
                            </h4>
                            <div className="max-h-64 overflow-y-auto rounded-lg border">
                              {searchResults.map((result, index) => (
                                <div 
                                  key={index}
                                  className="p-3 border-b text-sm hover:bg-secondary/50 cursor-pointer"
                                  onClick={() => handleSelectText(result)}
                                >
                                  {result.length > 100
                                    ? `${result.substring(0, 100)}...`
                                    : result}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <DocumentInsights document={selectedDocument} />
                      
                      <DocumentSummary document={selectedDocument} />
                      
                      <RelatedDocuments 
                        documentId={selectedDocument.id} 
                        allDocuments={documents}
                        onSelectDocument={(docId) => {
                          const doc = documents.find(d => d.id === docId);
                          if (doc) handleDocumentSelect(doc);
                        }}
                      />
                      
                      <div className="glass-card p-5 rounded-xl">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Presentation className="h-4 w-4 text-accent" />
                          Generate Slides
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Select text from the document or use the search function to find specific content.
                        </p>
                        <Button 
                          onClick={() => setActiveTab('generate')} 
                          disabled={!selectedText}
                          className="w-full bg-accent hover:bg-accent/90 text-white rounded-xl"
                        >
                          Create Presentation
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="generate" className="border-none p-0 animate-slide-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SlideGenerator 
                    initialText={selectedText}
                    onSlidesGenerated={handleSlidesGenerated}
                  />
                </div>
                <div className="glass-card p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Selected Text
                  </h3>
                  <div className="bg-secondary/30 p-4 rounded-lg text-sm max-h-[500px] overflow-y-auto">
                    {selectedText}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="border-none p-0 animate-slide-in">
              {selectedPresentation && (
                <SlidePreview 
                  presentation={selectedPresentation}
                  onClose={() => setActiveTab('documents')}
                  onDelete={() => {
                    setSelectedPresentation(null);
                    loadPresentations();
                    setActiveTab('presentations');
                  }}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;
