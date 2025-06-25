import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useSources } from '@/hooks/useSources';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import NotebookHeader from '@/components/notebook/NotebookHeader';
import SourcesSidebar from '@/components/notebook/SourcesSidebar';
import ChatArea from '@/components/notebook/ChatArea';
import StudioSidebar from '@/components/notebook/StudioSidebar';
import MobileNotebookTabs from '@/components/notebook/MobileNotebookTabs';
import { Citation } from '@/types/message';

const Notebook = () => {
  const { id: notebookId } = useParams();
  const { notebooks } = useNotebooks();
  const { sources } = useSources(notebookId);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const isDesktop = useIsDesktop();

  const notebook = notebooks?.find(n => n.id === notebookId);
  const hasSource = sources && sources.length > 0;
  const isSourceDocumentOpen = !!selectedCitation;

  const handleCitationClick = (citation: Citation) => {
    setSelectedCitation(citation);
  };

  const handleCitationClose = () => {
    setSelectedCitation(null);
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <NotebookHeader 
        title={notebook?.title || 'Untitled Notebook'} 
        notebookId={notebookId} 
      />
      
      {isDesktop ? (
        // Desktop layout: Left side (podcast + notes) | Right side (chat)
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Split between Podcast (top) and Notes (bottom) */}
          <div className="w-[40%] flex flex-col border-r border-gray-200">
            {/* Podcast Section - Top Half */}
            <div className="h-1/2 border-b border-gray-200">
              <div className="h-full bg-gray-50 p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Audio Overview</h3>
                <StudioSidebar 
                  notebookId={notebookId} 
                  onCitationClick={handleCitationClick}
                  showOnlyAudio={true}
                />
              </div>
            </div>
            
            {/* Notes Section - Bottom Half */}
            <div className="h-1/2">
              <div className="h-full bg-gray-50 p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                <StudioSidebar 
                  notebookId={notebookId} 
                  onCitationClick={handleCitationClick}
                  showOnlyNotes={true}
                />
              </div>
            </div>
          </div>
          
          {/* Right Side - Chat */}
          <div className="flex-1">
            <ChatArea 
              hasSource={hasSource || false} 
              notebookId={notebookId}
              notebook={notebook}
              onCitationClick={handleCitationClick}
            />
          </div>
          
          {/* Sources Sidebar - Show when citation is selected */}
          {isSourceDocumentOpen && (
            <div className="w-[35%] border-l border-gray-200">
              <SourcesSidebar 
                hasSource={hasSource || false} 
                notebookId={notebookId}
                selectedCitation={selectedCitation}
                onCitationClose={handleCitationClose}
                setSelectedCitation={setSelectedCitation}
              />
            </div>
          )}
        </div>
      ) : (
        // Mobile/Tablet layout (tabs)
        <MobileNotebookTabs
          hasSource={hasSource || false}
          notebookId={notebookId}
          notebook={notebook}
          selectedCitation={selectedCitation}
          onCitationClose={handleCitationClose}
          setSelectedCitation={setSelectedCitation}
          onCitationClick={handleCitationClick}
        />
      )}
    </div>
  );
};

export default Notebook;