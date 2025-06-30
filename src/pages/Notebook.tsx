import React, { useState, useEffect } from 'react';
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
import NotesCarousel from '@/components/notebook/NotesCarousel';
import { useAudioOverview } from '@/hooks/useAudioOverview';
import { useNotes } from '@/hooks/useNotes';
import { Plus, Headphones, Gamepad2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import QuizDialog from '@/components/quiz/QuizDialog';

const Notebook = () => {
  const { id: notebookId } = useParams();
  const { notebooks } = useNotebooks();
  const { sources } = useSources(notebookId);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [showSourcesSheet, setShowSourcesSheet] = useState(false);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const isDesktop = useIsDesktop();

  const { 
    notes, 
    createNote, 
    isCreating, 
    updateNote, 
    isUpdating, 
    deleteNote, 
    isDeleting 
  } = useNotes(notebookId);
  const notebook = notebooks?.find(n => n.id === notebookId);
  const hasSource = sources && sources.length > 0;
  const isSourceDocumentOpen = !!selectedCitation;
  const audioUrl = notebook?.audio_overview_url;
  const audioExpiresAt = notebook?.audio_url_expires_at;

  const [selectedNote, setSelectedNote] = useState(notes && notes.length > 0 ? notes[0] : null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  const { generateAudioOverview, isGenerating } = useAudioOverview(notebookId);

  const handleCitationClick = (citation: Citation) => {
    setSelectedCitation(citation);
  };

  const handleCitationClose = () => {
    setSelectedCitation(null);
  };

  const handleNoteSave = (title: string, content: string) => {
    if (selectedNote) {
      // עדכון הערה קיימת
      updateNote({ 
        id: selectedNote.id, 
        title, 
        content 
      });
    } else {
      // יצירת הערה חדשה
      createNote({ 
        title, 
        content, 
        source_type: 'user' 
      });
      setIsCreatingNote(false);
      // ההערה החדשה תיבחר אוטומטית ב-useEffect
    }
  };

  const handleNoteDelete = () => {
    if (selectedNote) {
      deleteNote(selectedNote.id);
      setSelectedNote(notes && notes.length > 1 ? notes[0] : null);
    }
  };

  const handleNoteCancel = () => {
    setIsCreatingNote(false);
    setSelectedNote(notes && notes.length > 0 ? notes[0] : null);
  };

  // עדכון ההערה הנבחרת כשרשימת ההערות משתנה
  useEffect(() => {
    if (notes && notes.length > 0 && !selectedNote && !isCreatingNote) {
      setSelectedNote(notes[0]);
    }
  }, [notes, selectedNote, isCreatingNote]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <NotebookHeader 
        title={notebook?.title || 'מחברת ללא כותרת'} 
        notebookId={notebookId} 
        onSourcesClick={() => setShowSourcesSheet(true)}
        sourcesCount={sources?.length || 0}
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
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold rounded-full shadow hover:from-orange-500 hover:to-red-600 transition-all transform hover:scale-105"
                  onClick={() => generateAudioOverview(notebookId)}
                  disabled={isGenerating}
                >
                  <Headphones className="w-5 h-5" />
                  {isGenerating ? 'יוצר פודקאסט...' : 'צור פודקאסט'}
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-full shadow hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105"
                  onClick={() => setShowQuizDialog(true)}
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
            {/* Notes Carousel */}
            <div className="flex-1 overflow-hidden">
              <NotesCarousel 
                notes={notes || []}
                isCreating={isCreating}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
                onNoteSave={handleNoteSave}
                onNoteDelete={handleNoteDelete}
                onCreateNote={() => {
                  setSelectedNote(null);
                  setIsCreatingNote(true);
                }}
                selectedNote={selectedNote}
                setSelectedNote={setSelectedNote}
                isCreatingNote={isCreatingNote}
                setIsCreatingNote={setIsCreatingNote}
              />
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

      {/* Sources Sheet for Desktop */}
      <Sheet open={showSourcesSheet} onOpenChange={setShowSourcesSheet}>
        <SheetContent side="right" className="w-[480px] p-0 overflow-hidden">
          <SheetHeader className="p-4 border-b border-gray-100">
            <SheetTitle className="text-right">מקורות המחברת</SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-hidden">
            <SourcesSidebar 
              hasSource={hasSource || false}
              notebookId={notebookId}
              selectedCitation={selectedCitation}
              onCitationClose={handleCitationClose}
              setSelectedCitation={setSelectedCitation}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Quiz Dialog */}
      <QuizDialog
        isOpen={showQuizDialog}
        onClose={() => setShowQuizDialog(false)}
        notebookId={notebookId || ''}
        notebookTitle={notebook?.title || 'מחברת ללא כותרת'}
      />
    </div>
  );
};

export default Notebook;