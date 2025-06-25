import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, MessageCircle, NotebookPen, Headphones } from 'lucide-react';
import SourcesSidebar from './SourcesSidebar';
import ChatArea from './ChatArea';
import StudioSidebar from './StudioSidebar';
import { Citation } from '@/types/message';

interface MobileNotebookTabsProps {
  hasSource: boolean;
  notebookId?: string;
  notebook?: {
    id: string;
    title: string;
    description?: string;
    generation_status?: string;
    icon?: string;
    example_questions?: string[];
  } | null;
  selectedCitation?: Citation | null;
  onCitationClose?: () => void;
  setSelectedCitation?: (citation: Citation | null) => void;
  onCitationClick?: (citation: Citation) => void;
}

const MobileNotebookTabs = ({
  hasSource,
  notebookId,
  notebook,
  selectedCitation,
  onCitationClose,
  setSelectedCitation,
  onCitationClick
}: MobileNotebookTabsProps) => {
  return (
    <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
      <TabsList className="grid w-full grid-cols-4 bg-white p-1 h-14 rounded-none border-b border-gray-100">
        <TabsTrigger 
          value="sources" 
          className="flex flex-col items-center justify-center space-y-1 text-sm data-[state=active]:bg-gray-50 data-[state=active]:shadow-none rounded-lg"
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs">מקורות</span>
        </TabsTrigger>
        <TabsTrigger 
          value="chat" 
          className="flex flex-col items-center justify-center space-y-1 text-sm data-[state=active]:bg-gray-50 data-[state=active]:shadow-none rounded-lg"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-xs">צ'אט</span>
        </TabsTrigger>
        <TabsTrigger 
          value="podcast" 
          className="flex flex-col items-center justify-center space-y-1 text-sm data-[state=active]:bg-gray-50 data-[state=active]:shadow-none rounded-lg"
        >
          <Headphones className="h-5 w-5" />
          <span className="text-xs">אודיו</span>
        </TabsTrigger>
        <TabsTrigger 
          value="notes" 
          className="flex flex-col items-center justify-center space-y-1 text-sm data-[state=active]:bg-gray-50 data-[state=active]:shadow-none rounded-lg"
        >
          <NotebookPen className="h-5 w-5" />
          <span className="text-xs">הערות</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="sources" className="flex-1 overflow-hidden mt-0">
        <SourcesSidebar 
          hasSource={hasSource}
          notebookId={notebookId}
          selectedCitation={selectedCitation}
          onCitationClose={onCitationClose}
          setSelectedCitation={setSelectedCitation}
        />
      </TabsContent>

      <TabsContent value="chat" className="flex-1 overflow-hidden mt-0">
        <ChatArea 
          hasSource={hasSource}
          notebookId={notebookId}
          notebook={notebook}
          onCitationClick={onCitationClick}
        />
      </TabsContent>

      <TabsContent value="podcast" className="flex-1 overflow-hidden mt-0">
        <div className="h-full bg-white p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">סקירת אודיו</h3>
          <StudioSidebar 
            notebookId={notebookId}
            onCitationClick={onCitationClick}
            showOnlyAudio={true}
          />
        </div>
      </TabsContent>

      <TabsContent value="notes" className="flex-1 overflow-hidden mt-0">
        <div className="h-full bg-white p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">הערות</h3>
          <StudioSidebar 
            notebookId={notebookId}
            onCitationClick={onCitationClick}
            showOnlyNotes={true}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default MobileNotebookTabs;