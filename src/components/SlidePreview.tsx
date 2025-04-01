
import React from 'react';
import { Slide, SlidePresentation } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, Trash2 } from 'lucide-react';
import { deleteSlidePresentation } from '@/utils/localStorage';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface SlidePreviewProps {
  presentation: SlidePresentation;
  onClose: () => void;
  onDelete: () => void;
}

const SlidePreview: React.FC<SlidePreviewProps> = ({ presentation, onClose, onDelete }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  const slideRef = React.useRef<HTMLDivElement>(null);

  const currentSlide = presentation.slides[currentSlideIndex];
  const totalSlides = presentation.slides.length;

  const goToNextSlide = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleDelete = () => {
    deleteSlidePresentation(presentation.id);
    toast.success('Presentation deleted');
    onDelete();
  };

  const exportToPDF = async () => {
    const { slides, title } = presentation;
    
    try {
      toast.info('Preparing PDF for download...');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1600, 900]
      });
      
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        // Create a temporary div for the slide
        const tempSlide = document.createElement('div');
        tempSlide.className = 'slide';
        tempSlide.style.width = '1600px';
        tempSlide.style.height = '900px';
        tempSlide.style.backgroundColor = presentation.theme.backgroundColor;
        tempSlide.style.color = presentation.theme.textColor;
        tempSlide.style.fontFamily = presentation.theme.fontFamily;
        tempSlide.style.padding = '60px';
        document.body.appendChild(tempSlide);
        
        // Add content to the slide
        tempSlide.innerHTML = `
          <h1 style="font-size: 48px; margin-bottom: 40px;">${slide.title}</h1>
          <div style="font-size: 32px; white-space: pre-line;">${slide.content}</div>
        `;
        
        // Convert to canvas and add to PDF
        const canvas = await html2canvas(tempSlide, {
          scale: 1,
          useCORS: true,
          logging: false,
        });
        
        const imageData = canvas.toDataURL('image/jpeg', 0.7);
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imageData, 'JPEG', 0, 0, 1600, 900);
        
        // Remove the temporary div
        document.body.removeChild(tempSlide);
      }
      
      // Save the PDF
      pdf.save(`${title}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export presentation to PDF');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-secondary p-3 rounded-t-lg flex justify-between items-center">
        <h3 className="font-medium">{presentation.title}</h3>
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost" onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-1" />
            Export PDF
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 bg-secondary/50 p-6 flex items-center justify-center">
        <div 
          ref={slideRef}
          className="slide max-w-3xl w-full p-10 aspect-video"
          style={{
            backgroundColor: presentation.theme.backgroundColor,
            color: presentation.theme.textColor,
            fontFamily: presentation.theme.fontFamily,
          }}
        >
          <h1 className="text-3xl font-bold mb-6">{currentSlide.title}</h1>
          <div className="text-xl whitespace-pre-line">{currentSlide.content}</div>
        </div>
      </div>
      
      <div className="bg-secondary p-3 rounded-b-lg flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={goToPrevSlide}
            disabled={currentSlideIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="mx-2 text-sm">
            {currentSlideIndex + 1} / {totalSlides}
          </span>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={goToNextSlide}
            disabled={currentSlideIndex === totalSlides - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button size="sm" onClick={onClose}>Close Preview</Button>
      </div>
    </div>
  );
};

export default SlidePreview;
