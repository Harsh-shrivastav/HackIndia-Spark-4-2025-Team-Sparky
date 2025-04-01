
export interface BaseDocument {
  id: string;
  name: string;
  dateAdded: Date;
  fileType: DocumentType;
  content: string;
}

export type DocumentType = 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'txt';

export interface PDFDocument extends BaseDocument {
  fileType: 'pdf';
}

export interface Slide {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface SlideTheme {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

export interface SlidePresentation {
  id: string;
  title: string;
  slides: Slide[];
  theme: SlideTheme;
  dateCreated: Date;
  dateModified: Date;
}

export interface DocumentSummary {
  id: string;
  documentId: string;
  content: string;
  dateGenerated: Date;
}

export interface SearchResult {
  documentId: string;
  documentName: string;
  documentType: DocumentType;
  snippet: string;
  relevanceScore: number;
}

export interface RelatedDocument {
  id: string;
  name: string;
  similarity: number;
  fileType: DocumentType;
}

export type FileWithPath = File & { path?: string };
