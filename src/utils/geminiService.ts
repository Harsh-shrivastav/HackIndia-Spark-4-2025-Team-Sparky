
import { DocumentSummary, PDFDocument, RelatedDocument, SearchResult, Slide, SlideTheme } from '@/types';

// The API key from your environment
const API_KEY = "AIzaSyCwJy03SvC1PC4FOjY5EGzvnbAMjqn4ZJg";
// Using the free gemini-1.0-pro model instead of gemini-pro
const MODEL_NAME = "gemini-1.5-flash";

interface GenerateSlideOptions {
  text: string;
  theme?: SlideTheme;
  numSlides?: number;
}

export const generateSlidesFromText = async (
  options: GenerateSlideOptions
): Promise<Slide[]> => {
  try {
    const { text, theme, numSlides = 3 } = options;
    
    const prompt = `
      Create ${numSlides} presentation slides from the following text. 
      For each slide, provide a title and content in a concise, bullet-point format.
      If possible, suggest an appropriate image description that would complement each slide.
      
      Text: ${text}
      
      Format your response as a JSON array with the following structure for each slide:
      [
        {
          "title": "Slide Title",
          "content": "Bullet point content, formatted with line breaks",
          "imageDescription": "Description of an appropriate image for this slide"
        }
      ]
    `;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON array from response
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from Gemini response');
    }
    
    const slidesData = JSON.parse(jsonMatch[0]);
    
    // Convert to our Slide format
    const slides: Slide[] = slidesData.map((slide: any, index: number) => ({
      id: crypto.randomUUID(),
      title: slide.title,
      content: slide.content,
      imageUrl: '', // We'd need an image API to get real images
      backgroundColor: theme?.backgroundColor || '#ffffff',
      textColor: theme?.textColor || '#000000',
    }));
    
    return slides;
  } catch (error) {
    console.error('Error generating slides:', error);
    throw new Error('Failed to generate slides using AI');
  }
};

export const getSuggestedTheme = async (topic: string): Promise<SlideTheme> => {
  try {
    const prompt = `
      Suggest a color scheme and font for a presentation about "${topic}".
      Return your response as a JSON object with these properties:
      - backgroundColor: a hex code for slide background
      - textColor: a hex code for text color
      - fontFamily: a common font name like 'Arial', 'Roboto', 'Georgia', etc.
      - name: a name for this theme
    `;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
          }
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON object from response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Fallback theme if parsing fails
      return {
        id: crypto.randomUUID(),
        name: 'Professional Blue',
        backgroundColor: '#f8f9fa',
        textColor: '#212529',
        fontFamily: 'Roboto, sans-serif',
      };
    }
    
    const themeData = JSON.parse(jsonMatch[0]);
    
    return {
      id: crypto.randomUUID(),
      name: themeData.name || 'Custom Theme',
      backgroundColor: themeData.backgroundColor || '#f8f9fa',
      textColor: themeData.textColor || '#212529',
      fontFamily: themeData.fontFamily || 'Roboto, sans-serif',
    };
  } catch (error) {
    console.error('Error generating theme suggestion:', error);
    // Return a default theme if the API call fails
    return {
      id: crypto.randomUUID(),
      name: 'Professional Blue',
      backgroundColor: '#f8f9fa',
      textColor: '#212529',
      fontFamily: 'Roboto, sans-serif',
    };
  }
};

// Function to generate document summaries
export const generateDocumentSummary = async (content: string): Promise<string> => {
  try {
    // If content is too large, truncate it
    const truncatedContent = content.length > 12000 
      ? content.substring(0, 12000) + '...' 
      : content;
    
    const prompt = `
      Provide a comprehensive summary of the following document. 
      Include the main topics, key points, and important conclusions.
      Keep the summary concise but informative.
      
      Document content:
      ${truncatedContent}
    `;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          }
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating document summary:', error);
    throw new Error('Failed to generate document summary');
  }
};

// Function to find related documents
export const findRelatedDocuments = async (
  sourceDoc: PDFDocument,
  otherDocs: PDFDocument[]
): Promise<RelatedDocument[]> => {
  try {
    if (otherDocs.length === 0) return [];
    
    // Prepare document content for comparison
    // For large documents, we'll use a summary or extract
    const sourceContent = sourceDoc.content.length > 5000 
      ? sourceDoc.content.substring(0, 5000) 
      : sourceDoc.content;
    
    // Prepare a list of other documents with shortened content
    const docsForComparison = otherDocs.map(doc => ({
      id: doc.id,
      name: doc.name,
      content: doc.content.length > 2000 ? doc.content.substring(0, 2000) : doc.content,
      fileType: doc.fileType
    }));
    
    const prompt = `
      I have a document with the following content:
      "${sourceContent}"
      
      I also have these other documents:
      ${docsForComparison.map((doc, index) => 
        `Document ${index + 1}: "${doc.name}"\n${doc.content}\n\n`
      ).join('')}
      
      Which of these other documents are most related to the first document? 
      Rate each on a scale of 0.0 to 1.0 where 1.0 means highly related and 0.0 means not related at all.
      
      Return your response as a JSON array with this structure:
      [
        {
          "documentIndex": 1, // 1-based index from the list
          "similarityScore": 0.85, // 0.0 to 1.0
          "reason": "Brief explanation of why these documents are related"
        }
      ]
      
      Only include documents with similarity scores above 0.3.
    `;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
          }
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON array from response
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [];
    }
    
    const relatedDocsData = JSON.parse(jsonMatch[0]);
    
    // Convert to our RelatedDocument format
    return relatedDocsData.map((item: any) => {
      const docIndex = item.documentIndex - 1; // Convert to 0-based index
      const doc = docsForComparison[docIndex];
      
      return {
        id: doc.id,
        name: doc.name,
        similarity: item.similarityScore,
        fileType: doc.fileType,
      };
    });
  } catch (error) {
    console.error('Error finding related documents:', error);
    return [];
  }
};

// Enhanced search with natural language understanding
export const enhancedSearch = async (query: string, documents: PDFDocument[]): Promise<SearchResult[]> => {
  try {
    if (documents.length === 0) return [];
    
    // For simple queries, use the traditional search approach
    if (query.split(' ').length <= 3) {
      // Use the traditional search
      return documents.flatMap(doc => {
        const snippets = searchInPDF(doc, query);
        return snippets.map(snippet => ({
          documentId: doc.id,
          documentName: doc.name,
          documentType: doc.fileType,
          snippet: snippet.length > 200 ? snippet.substring(0, 200) + '...' : snippet,
          relevanceScore: calculateSimpleRelevance(snippet, query)
        }));
      }).sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
    
    // For complex queries, use AI to understand intent
    const prompt = `
      I'm searching for documents with this query: "${query}"
      
      I have these documents:
      ${documents.map((doc, index) => 
        `Document ${index + 1}: "${doc.name}"\n${doc.content.substring(0, Math.min(3000, doc.content.length))}\n\n`
      ).join('')}
      
      Find the 5 most relevant snippets across all documents that answer my query.
      For each result, include:
      1. The document number
      2. A relevant excerpt (maximum 200 characters)
      3. A relevance score from 0.0 to 1.0
      
      Return your response as a JSON array:
      [
        {
          "documentIndex": 1,
          "snippet": "The relevant text from the document...",
          "relevanceScore": 0.92
        }
      ]
    `;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
          }
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON array from response
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [];
    }
    
    const searchResultsData = JSON.parse(jsonMatch[0]);
    
    // Convert to our SearchResult format
    return searchResultsData.map((item: any) => {
      const docIndex = item.documentIndex - 1; // Convert to 0-based index
      const doc = documents[docIndex];
      
      return {
        documentId: doc.id,
        documentName: doc.name,
        documentType: doc.fileType,
        snippet: item.snippet,
        relevanceScore: item.relevanceScore,
      };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  } catch (error) {
    console.error('Error in enhanced search:', error);
    
    // Fallback to basic search
    return documents.flatMap(doc => {
      const snippets = searchInPDF(doc, query);
      return snippets.map(snippet => ({
        documentId: doc.id,
        documentName: doc.name,
        documentType: doc.fileType,
        snippet: snippet.length > 200 ? snippet.substring(0, 200) + '...' : snippet,
        relevanceScore: calculateSimpleRelevance(snippet, query)
      }));
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
};

// New function for generating AI-driven insights from a document
export const generateDocumentInsights = async (document: PDFDocument): Promise<string[]> => {
  try {
    const truncatedContent = document.content.length > 10000 
      ? document.content.substring(0, 10000) + '...' 
      : document.content;
    
    const prompt = `
      Analyze the following document and provide 3-5 key insights or takeaways.
      Each insight should be a concise, actionable piece of information that a reader would find valuable.
      
      Document content:
      ${truncatedContent}
      
      Format your response as a JSON array of strings, each containing one insight:
      ["Insight 1", "Insight 2", "Insight 3"]
    `;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
          }
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON array from response
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return ["Could not generate insights for this document."];
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating document insights:', error);
    return ["Failed to generate insights. Please try again later."];
  }
};

// New function for generating improved slide templates
export const generateSlideTemplates = async (topic: string, slides: Slide[]): Promise<Slide[]> => {
  try {
    const prompt = `
      I have a presentation with the following slides about "${topic}":
      ${slides.map(slide => `
        Slide: ${slide.title}
        Content: ${slide.content}
      `).join('\n')}
      
      Suggest improvements for each slide to make them more engaging and professional.
      For each slide, provide:
      1. An improved title (if needed)
      2. Enhanced content (better phrasing, additional relevant points, etc.)
      3. A suggestion for visual elements
      
      Format your response as a JSON array with this structure:
      [
        {
          "originalTitle": "Original Slide Title",
          "improvedTitle": "Improved Slide Title",
          "improvedContent": "Enhanced bullet point content",
          "visualSuggestion": "Suggestion for visual element or design"
        }
      ]
    `;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          }
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON array from response
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return slides; // Return original slides if parsing fails
    }
    
    const improvements = JSON.parse(jsonMatch[0]);
    
    // Apply improvements to original slides
    return slides.map((slide, index) => {
      const improvement = improvements[index] || {};
      
      return {
        ...slide,
        title: improvement.improvedTitle || slide.title,
        content: improvement.improvedContent || slide.content,
        imageUrl: slide.imageUrl, // Keep original image URL
        backgroundColor: slide.backgroundColor,
        textColor: slide.textColor,
      };
    });
  } catch (error) {
    console.error('Error generating slide templates:', error);
    return slides; // Return original slides if API call fails
  }
};

// Helper function for basic relevance calculation
const calculateSimpleRelevance = (text: string, query: string): number => {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // Count occurrences
  const occurrences = (lowerText.match(new RegExp(lowerQuery, 'g')) || []).length;
  
  // Position factor
  const position = lowerText.indexOf(lowerQuery);
  const positionFactor = position >= 0 ? 1 / (1 + position / 100) : 0;
  
  return (occurrences * 0.6) + (positionFactor * 0.4);
};

// Function to search in PDF - duplicated for compatibility with existing code
const searchInPDF = (document: PDFDocument, query: string): string[] => {
  if (!query.trim()) return [];
  
  const lowerCaseQuery = query.toLowerCase();
  
  // Simple search implementation
  const paragraphs = document.content.split('\n\n');
  const results = paragraphs.filter(paragraph => 
    paragraph.toLowerCase().includes(lowerCaseQuery)
  );
  
  return results;
};
