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
import AudioPlayer from '@/components/notebook/AudioPlayer';
import NoteEditor from '@/components/notebook/NoteEditor';
import { useAudioOverview } from '@/hooks/useAudioOverview';
import { useNotes } from '@/hooks/useNotes';
import { Plus, Headphones, Gamepad2 } from 'lucide-react';

const Notebook = () => {
  const { id: notebookId } = useParams();
  const { notebooks } = useNotebooks();
  const { sources } = useSources(notebookId);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const isDesktop = useIsDesktop();

  const { notes } = useNotes(notebookId);
  const notebook = notebooks?.find(n => n.id === notebookId);
  const hasSource = sources && sources.length > 0;
  const isSourceDocumentOpen = !!selectedCitation;
  const audioUrl = notebook?.audio_overview_url;
  const audioExpiresAt = notebook?.audio_url_expires_at;

  const [selectedNote, setSelectedNote] = useState(notes && notes.length > 0 ? notes[0] : null);

  const { generateAudioOverview, isGenerating } = useAudioOverview(notebookId);

  const handleCitationClick = (citation: Citation) => {
    setSelectedCitation(citation);
  };

  const handleCitationClose = () => {
    setSelectedCitation(null);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <NotebookHeader 
        title={notebook?.title || 'מחברת ללא כותרת'} 
        notebookId={notebookId} 
      />
      
      {isDesktop ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Right Side - Chat */}
          <div className="flex-1 bg-white border-l border-gray-200 flex flex-col">
            <ChatArea 
              hasSource={hasSource || false} 
              notebookId={notebookId}
              notebook={notebook}
              onCitationClick={handleCitationClick}
            />
          </div>
          {/* Left Side - Podcast (top) + Notes (bottom) */}
          <div className="w-[480px] bg-white border-r border-gray-200 flex flex-col">
            {/* Podcast (AudioPlayer) */}
            <div className="h-1/2 min-h-[240px] max-h-[320px] border-b border-gray-100 flex-shrink-0 flex flex-col justify-center p-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-400 text-white font-bold rounded-full shadow hover:from-blue-500 hover:to-purple-500 transition-all"
                  onClick={() => generateAudioOverview(notebookId)}
                  disabled={isGenerating}
                >
                  <Headphones className="w-5 h-5" />
                  {isGenerating ? 'יוצר פודקאסט...' : 'צור פודקאסט'}
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold rounded-full shadow hover:from-green-500 hover:to-blue-500 transition-all"
                  // כרגע לא עושה כלום
                >
                  <Gamepad2 className="w-5 h-5" />
                  חידונים ומשחקי למידה
                </button>
              </div>
              {audioUrl ? (
                <AudioPlayer 
                  audioUrl={audioUrl}
                  notebookId={notebookId}
                  expiresAt={audioExpiresAt}
                  title={notebook?.title}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">אין פודקאסט זמין למחברת זו</div>
              )}
            </div>
            {/* Notes (NoteEditor) */}
            <div className="flex-1 overflow-auto p-4 flex flex-col">
              <div className="flex items-center mb-2">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-400 to-blue-400 text-white font-bold rounded-full shadow hover:from-purple-500 hover:to-blue-500 transition-all"
                  onClick={() => setSelectedNote({})} // יש להחליף למימוש יצירת פתקית
                >
                  <Plus className="w-5 h-5" />
                  צור פתקית חדשה
                </button>
              </div>
              {selectedNote ? (
                <NoteEditor 
                  note={selectedNote}
                  onSave={() => {}}
                  onDelete={() => {}}
                  onCancel={() => {}}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">אין הערות להצגה</div>
              )}
            </div>
          </div>
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