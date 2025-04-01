
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { generateSlidesFromText, getSuggestedTheme, generateSlideTemplates } from '@/utils/geminiService';
import { Slide, SlidePresentation, SlideTheme } from '@/types';
import { saveSlidePresentation } from '@/utils/localStorage';
import { toast } from 'sonner';

interface SlideGeneratorProps {
  initialText?: string;
  onSlidesGenerated: (presentation: SlidePresentation) => void;
}

const predefinedThemes: SlideTheme[] = [
  {
    id: 'professional',
    name: 'Professional Blue',
    backgroundColor: '#f8f9fa',
    textColor: '#212529',
    fontFamily: 'Roboto, sans-serif',
  },
  {
    id: 'creative',
    name: 'Creative Orange',
    backgroundColor: '#fff8f0',
    textColor: '#663300',
    fontFamily: 'Montserrat, sans-serif',
  },
  {
    id: 'minimal',
    name: 'Minimal Black',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontFamily: 'Inter, sans-serif',
  },
  {
    id: 'vibrant',
    name: 'Vibrant Purple',
    backgroundColor: '#f5f0ff',
    textColor: '#4b0082',
    fontFamily: 'Poppins, sans-serif',
  },
];

const SlideGenerator: React.FC<SlideGeneratorProps> = ({ initialText = '', onSlidesGenerated }) => {
  const [title, setTitle] = useState('New Presentation');
  const [text, setText] = useState(initialText);
  const [numSlides, setNumSlides] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('ai');
  const [useEnhancement, setUseEnhancement] = useState(true);
  const [layoutStyle, setLayoutStyle] = useState<'standard' | 'modern' | 'minimal'>('standard');

  const handleGenerateSlides = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to generate slides from');
      return;
    }

    try {
      setIsGenerating(true);
      
      let theme: SlideTheme;
      
      // Step 1: Get theme - either predefined or AI suggested
      if (selectedThemeId === 'ai') {
        // Use AI to suggest a theme based on text content
        theme = await getSuggestedTheme(text.substring(0, 100));
      } else {
        // Use a predefined theme
        theme = predefinedThemes.find(t => t.id === selectedThemeId) || predefinedThemes[0];
      }
      
      // Step 2: Generate slides based on text and theme
      let slides = await generateSlidesFromText({
        text,
        theme,
        numSlides,
      });
      
      // Step 3: Enhance slides if requested
      if (useEnhancement) {
        slides = await generateSlideTemplates(title, slides);
      }
      
      // Apply layout style to slides
      slides = slides.map(slide => ({
        ...slide,
        backgroundColor: layoutStyle === 'minimal' ? '#ffffff' : theme.backgroundColor,
        textColor: layoutStyle === 'minimal' ? '#000000' : theme.textColor,
      }));
      
      // Step 4: Create a new presentation
      const newPresentation: SlidePresentation = {
        id: crypto.randomUUID(),
        title: title || 'Untitled Presentation',
        slides,
        theme,
        dateCreated: new Date(),
        dateModified: new Date(),
      };
      
      // Step 5: Save presentation to local storage
      saveSlidePresentation(newPresentation);
      
      // Step 6: Notify parent component
      onSlidesGenerated(newPresentation);
      
      toast.success('Slides generated successfully!');
      setStep(1); // Reset step
    } catch (error) {
      console.error('Error generating slides:', error);
      toast.error('Failed to generate slides. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (step === 1) {
    return (
      <div className="space-y-4 border p-4 rounded-lg">
        <h2 className="text-xl font-bold">Generate Slides</h2>
        
        <div className="space-y-2">
          <Label htmlFor="title">Presentation Title</Label>
          <Input
            id="title"
            placeholder="Enter a title for your presentation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="text">Text Content</Label>
          <Textarea
            id="text"
            placeholder="Enter or paste text to convert into slides..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[150px]"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="numSlides">Number of Slides: {numSlides}</Label>
          </div>
          <Slider
            id="numSlides"
            min={1}
            max={10}
            step={1}
            value={[numSlides]}
            onValueChange={(value) => setNumSlides(value[0])}
          />
        </div>
        
        <Button
          onClick={() => setStep(2)}
          disabled={!text.trim()}
          className="w-full"
        >
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 border p-4 rounded-lg">
      <h2 className="text-xl font-bold">Customize Slides</h2>
      
      <div className="space-y-2">
        <Label htmlFor="theme">Theme</Label>
        <Select value={selectedThemeId} onValueChange={setSelectedThemeId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ai">AI Suggested Theme</SelectItem>
            {predefinedThemes.map((theme) => (
              <SelectItem key={theme.id} value={theme.id}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="layout">Layout Style</Label>
        <Select value={layoutStyle} onValueChange={(val: 'standard' | 'modern' | 'minimal') => setLayoutStyle(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a layout style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="modern">Modern</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="enhance"
          checked={useEnhancement}
          onCheckedChange={setUseEnhancement}
        />
        <Label htmlFor="enhance">Use AI enhancement for better slides</Label>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium">Presentation Summary</h3>
        <div className="bg-secondary p-3 rounded-md">
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {numSlides} slides will be generated from your text ({text.length} characters)
          </p>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={() => setStep(1)}
          disabled={isGenerating}
        >
          Back
        </Button>
        <Button
          onClick={handleGenerateSlides}
          disabled={isGenerating}
          className="flex-1"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Slides'
          )}
        </Button>
      </div>
    </div>
  );
};

export default SlideGenerator;
