import React, { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Citation } from '@/types/message';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';

interface SourceContentViewerProps {
  citation: Citation | null;
  sourceContent?: string;
  sourceSummary?: string;
  sourceUrl?: string;
  className?: string;
  isOpenedFromSourceList?: boolean;
}

const SourceContentViewer = ({ 
  citation, 
  sourceContent, 
  sourceSummary,
  sourceUrl,
  className = '',
  isOpenedFromSourceList = false
}: SourceContentViewerProps) => {
  const highlightedContentRef = useRef<HTMLDivElement>(null);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
  
  // Control accordion state based on how the viewer was opened
  const [accordionValue, setAccordionValue] = useState<string>(
    isOpenedFromSourceList ? "guide" : ""
  );

  // Check if we have valid citation line data (indicating a real citation click)
  const hasValidCitationLines = citation && 
    typeof citation.chunk_lines_from === 'number' && 
    typeof citation.chunk_lines_to === 'number' &&
    citation.chunk_lines_from > 0;

  // Auto-scroll to highlighted content when citation changes and has valid line data
  useEffect(() => {
    if (hasValidCitationLines && highlightedContentRef.current && scrollAreaViewportRef.current) {
      // Increased delay to ensure DOM has fully updated
      const timer = setTimeout(() => {
        if (highlightedContentRef.current && scrollAreaViewportRef.current) {
          // Find the actual viewport element within the ScrollArea
          const scrollAreaElement = scrollAreaViewportRef.current;
          const viewport = scrollAreaElement.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
          
          if (viewport && highlightedContentRef.current) {
            const highlightedElement = highlightedContentRef.current;
            
            // Calculate the scroll position to center the highlighted content
            const scrollTop = highlightedElement.offsetTop - (viewport.clientHeight / 2) + (highlightedElement.clientHeight / 2);
            const targetScrollTop = Math.max(0, scrollTop);
            
            viewport.scrollTo({
              top: targetScrollTop,
              behavior: 'smooth'
            });
          }
        }
      }, 300); // Increased delay for better reliability

      return () => clearTimeout(timer);
    }
  }, [citation?.citation_id, citation?.chunk_lines_from, citation?.chunk_lines_to, citation?.source_id, hasValidCitationLines]);

  // Close guide when a real citation is clicked (has valid line data)
  useEffect(() => {
    if (hasValidCitationLines) {
      setAccordionValue("");
    }
  }, [hasValidCitationLines]);

  if (!citation || !sourceContent) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="text-sm">בחר ציטוט כדי לצפות בתוכן המקור</p>
      </div>
    );
  }

  const getSourceIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      'pdf': '/file-types/PDF.svg',
      'text': '/file-types/TXT.png',
      'website': '/file-types/WEB.svg',
      'youtube': '/file-types/MP3.png',
      'audio': '/file-types/MP3.png',
      'doc': '/file-types/DOC.png',
      'multiple-websites': '/file-types/WEB.svg',
      'copied-text': '/file-types/TXT.png'
    };

    const iconUrl = iconMap[type] || iconMap['text']; // fallback to TXT icon
    
    return (
      <img 
        src={iconUrl} 
        alt={`${type} icon`} 
        className="w-full h-full object-contain"
        onError={(e) => {
          // Fallback to a simple text indicator if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = '📄';
        }}
      />
    );
  };

  // Split content into lines for highlighting
  const lines = sourceContent.split('\n');
  
  // Determine the highlight range based on whether we have valid citation line data
  let startLine: number;
  let endLine: number;
  
  if (hasValidCitationLines) {
    // For real citations with valid line data, highlight the specific lines
    startLine = citation.chunk_lines_from!;
    endLine = citation.chunk_lines_to!;
  } else {
    // For source list clicks or citations without line data, don't highlight
    startLine = -1;
    endLine = -1;
  }

  const renderHighlightedContent = () => {
    return lines.map((line, index) => {
      const lineNumber = index + 1;
      const isHighlighted = startLine > 0 && lineNumber >= startLine && lineNumber <= endLine;
      const isFirstHighlightedLine = isHighlighted && lineNumber === startLine;
      
      return (
        <div
          key={index}
          ref={isFirstHighlightedLine ? highlightedContentRef : null}
          className={`py-2 px-3 rounded leading-relaxed ${
            isHighlighted 
              ? 'border-r-4' 
              : 'hover:bg-gray-50'
          }`}
          style={isHighlighted ? { 
            backgroundColor: '#eadef9', 
            borderRightColor: '#9333ea' 
          } : {}}
        >
          <span className={isHighlighted ? 'font-medium' : ''}>{line}</span>
        </div>
      );
    });
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-6 h-6 bg-white rounded border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {getSourceIcon(citation.source_type)}
          </div>
          <span className="font-medium text-gray-900 truncate">{citation.source_title}</span>
        </div>
      </div>

      {/* Source Guide Accordion */}
      {sourceSummary && (
        <div className="border-b border-gray-100 flex-shrink-0">
          <Accordion type="single" value={accordionValue} onValueChange={setAccordionValue} collapsible>
            <AccordionItem value="guide" className="border-0">
              <AccordionTrigger 
                className="px-4 py-3 text-sm font-medium hover:no-underline hover:bg-blue-50" 
                style={{ color: '#234776' }}
                chevronColor="#234776"
              >
                <div className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#234776">
                    <path d="M166.67-120.67 120-167.33l317.67-318L254-531l194-121-16.33-228 175 147L818-818.33l-85.67 211.66L880-432l-228.67-16.67-120.66 194L485-438.33 166.67-120.67Zm24.66-536L120-728l72-72 71.33 71.33-72 72Zm366.34 233 58-94.33 111 8.33-72-85 41.66-102.66-102.66 41.66-85-71.66L517-616.67l-94.33 59 108 26.67 27 107.33Zm171 303.67-71.34-72 71.34-71.33 71.33 72L728.67-120ZM575-576Z"/>
                  </svg>
                  <span>מדריך מקור</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <Card className="p-4 border-0 bg-blue-50">
                  <div className="text-sm text-gray-700 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">תקציר</h4>
                      <p className="leading-relaxed">{sourceSummary}</p>
                    </div>
                    
                    {/* Show URL for website sources */}
                    {citation.source_type === 'website' && sourceUrl && (
                      <div>
                        <h4 className="font-medium mb-2">כתובת URL</h4>
                        <a 
                          href={sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline break-all text-sm"
                        >
                          {sourceUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1 h-full" ref={scrollAreaViewportRef}>
        <div className="p-4">
          <div className="prose prose-gray max-w-none space-y-1">
            {renderHighlightedContent()}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SourceContentViewer;