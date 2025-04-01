
import { DocumentSummary, PDFDocument, SlidePresentation } from '@/types';

const PDF_STORAGE_KEY = 'pdf_documents';
const SLIDE_STORAGE_KEY = 'slide_presentations';
const SUMMARY_STORAGE_KEY = 'document_summaries';

// PDF Document Storage
export const savePDFDocument = (document: PDFDocument): void => {
  const documents = getPDFDocuments();
  documents.push(document);
  localStorage.setItem(PDF_STORAGE_KEY, JSON.stringify(documents));
};

export const getPDFDocuments = (): PDFDocument[] => {
  const documents = localStorage.getItem(PDF_STORAGE_KEY);
  if (!documents) return [];
  
  try {
    const parsed = JSON.parse(documents);
    return parsed.map((doc: any) => ({
      ...doc,
      dateAdded: new Date(doc.dateAdded)
    }));
  } catch (error) {
    console.error('Error parsing PDF documents from localStorage:', error);
    return [];
  }
};

export const deletePDFDocument = (id: string): void => {
  const documents = getPDFDocuments();
  const filtered = documents.filter(doc => doc.id !== id);
  localStorage.setItem(PDF_STORAGE_KEY, JSON.stringify(filtered));
  
  // Also delete any summaries for this document
  const summaries = getDocumentSummaries();
  const filteredSummaries = summaries.filter(summary => summary.documentId !== id);
  localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(filteredSummaries));
};

// Slide Presentation Storage
export const saveSlidePresentation = (presentation: SlidePresentation): void => {
  const presentations = getSlidePresentations();
  const existingIndex = presentations.findIndex(p => p.id === presentation.id);
  
  if (existingIndex >= 0) {
    presentations[existingIndex] = {
      ...presentation,
      dateModified: new Date()
    };
  } else {
    presentations.push(presentation);
  }
  
  localStorage.setItem(SLIDE_STORAGE_KEY, JSON.stringify(presentations));
};

export const getSlidePresentations = (): SlidePresentation[] => {
  const presentations = localStorage.getItem(SLIDE_STORAGE_KEY);
  if (!presentations) return [];
  
  try {
    const parsed = JSON.parse(presentations);
    return parsed.map((pres: any) => ({
      ...pres,
      dateCreated: new Date(pres.dateCreated),
      dateModified: new Date(pres.dateModified)
    }));
  } catch (error) {
    console.error('Error parsing slide presentations from localStorage:', error);
    return [];
  }
};

export const deleteSlidePresentation = (id: string): void => {
  const presentations = getSlidePresentations();
  const filtered = presentations.filter(pres => pres.id !== id);
  localStorage.setItem(SLIDE_STORAGE_KEY, JSON.stringify(filtered));
};

// Document Summary Storage
export const saveDocumentSummary = (summary: DocumentSummary): void => {
  const summaries = getDocumentSummaries();
  
  // Replace if exists
  const existingIndex = summaries.findIndex(s => s.documentId === summary.documentId);
  if (existingIndex >= 0) {
    summaries[existingIndex] = summary;
  } else {
    summaries.push(summary);
  }
  
  localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(summaries));
};

export const getDocumentSummaries = (): DocumentSummary[] => {
  const summaries = localStorage.getItem(SUMMARY_STORAGE_KEY);
  if (!summaries) return [];
  
  try {
    const parsed = JSON.parse(summaries);
    return parsed.map((summary: any) => ({
      ...summary,
      dateGenerated: new Date(summary.dateGenerated)
    }));
  } catch (error) {
    console.error('Error parsing document summaries from localStorage:', error);
    return [];
  }
};

export const getDocumentSummary = (documentId: string): DocumentSummary | null => {
  const summaries = getDocumentSummaries();
  return summaries.find(summary => summary.documentId === documentId) || null;
};
