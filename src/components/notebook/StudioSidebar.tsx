import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MoreVertical, Plus, Edit, Bot, User, Loader2, AlertCircle, CheckCircle2, RefreshCw, Headphones } from 'lucide-react';
import { useNotes, Note } from '@/hooks/useNotes';
import { useAudioOverview } from '@/hooks/useAudioOverview';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useSources } from '@/hooks/useSources';
import { useQueryClient } from '@tanstack/react-query';
import NoteEditor from './NoteEditor';
import AudioPlayer from './AudioPlayer';
import { Citation } from '@/types/message';

interface StudioSidebarProps {
  notebookId?: string;
  isExpanded?: boolean;
  onCitationClick?: (citation: Citation) => void;
  showOnlyAudio?: boolean;
  showOnlyNotes?: boolean;
}

const StudioSidebar = ({
  notebookId,
  isExpanded,
  onCitationClick,
  showOnlyAudio = false,
  showOnlyNotes = false
}: StudioSidebarProps) => {
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    isCreating,
    isUpdating,
    isDeleting
  } = useNotes(notebookId);
  const {
    notebooks
  } = useNotebooks();
  const {
    sources
  } = useSources(notebookId);
  const {
    generateAudioOverview,
    refreshAudioUrl,
    autoRefreshIfExpired,
    isGenerating,
    isAutoRefreshing,
    generationStatus,
    checkAudioExpiry
  } = useAudioOverview(notebookId);
  const queryClient = useQueryClient();
  const notebook = notebooks?.find(n => n.id === notebookId);
  const hasValidAudio = notebook?.audio_overview_url && !checkAudioExpiry(notebook.audio_url_expires_at);
  const currentStatus = generationStatus || notebook?.audio_overview_generation_status;
  
  // Check if at least one source has been successfully processed
  const hasProcessedSource = sources?.some(source => source.processing_status === 'completed') || false;

  // Auto-refresh expired URLs
  useEffect(() => {
    if (!notebookId || !notebook?.audio_overview_url) return;
    
    const checkAndRefresh = async () => {
      if (checkAudioExpiry(notebook.audio_url_expires_at)) {
        console.log('Detected expired audio URL, initiating auto-refresh...');
        await autoRefreshIfExpired(notebookId, notebook.audio_url_expires_at);
      }
    };

    // Check immediately
    checkAndRefresh();

    // Set up periodic check every 5 minutes
    const interval = setInterval(checkAndRefresh, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [notebookId, notebook?.audio_overview_url, notebook?.audio_url_expires_at, autoRefreshIfExpired, checkAudioExpiry]);

  const handleCreateNote = () => {
    setIsCreatingNote(true);
    setEditingNote(null);
  };

  const handleEditNote = (note: Note) => {
    console.log('StudioSidebar: Opening note', {
      noteId: note.id,
      sourceType: note.source_type
    });
    setEditingNote(note);
    setIsCreatingNote(false);
  };

  const handleSaveNote = (title: string, content: string) => {
    if (editingNote) {
      // Only allow updating user notes, not AI responses
      if (editingNote.source_type === 'user') {
        updateNote({
          id: editingNote.id,
          title,
          content
        });
      }
    } else {
      createNote({
        title,
        content,
        source_type: 'user'
      });
    }
    setEditingNote(null);
    setIsCreatingNote(false);
  };

  const handleDeleteNote = () => {
    if (editingNote) {
      deleteNote(editingNote.id);
      setEditingNote(null);
    }
  };

  const handleCancel = () => {
    setEditingNote(null);
    setIsCreatingNote(false);
  };

  const handleGenerateAudio = () => {
    if (notebookId) {
      generateAudioOverview(notebookId);
      setAudioError(false);
    }
  };

  const handleAudioError = () => {
    setAudioError(true);
  };

  const handleAudioRetry = () => {
    // Regenerate the audio overview
    handleGenerateAudio();
  };

  const handleAudioDeleted = () => {
    // Refresh the notebooks data to update the UI
    if (notebookId) {
      queryClient.invalidateQueries({
        queryKey: ['notebooks']
      });
    }
    setAudioError(false);
  };

  const handleUrlRefresh = (notebookId: string) => {
    refreshAudioUrl(notebookId);
  };

  const getStatusDisplay = () => {
    if (isAutoRefreshing) {
      return {
        icon: null,
        text: "מרענן URL...",
        description: "מעדכן גישה לאודיו"
      };
    }
    
    if (currentStatus === 'generating' || isGenerating) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin text-blue-600" />,
        text: "יוצר אודיו...",
        description: "זה עלול לקחת כמה דקות"
      };
    } else if (currentStatus === 'failed') {
      return {
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        text: "יצירה נכשלה",
        description: "אנא נסה שוב"
      };
    } else if (currentStatus === 'completed' && hasValidAudio) {
      return {
        icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
        text: "מוכן לנגינה",
        description: "סקירת אודיו זמינה"
      };
    }
    return null;
  };

  const isEditingMode = editingNote || isCreatingNote;
  const getPreviewText = (note: Note) => {
    if (note.source_type === 'ai_response') {
      // Use extracted_text if available, otherwise parse the content
      if (note.extracted_text) {
        return note.extracted_text;
      }
      try {
        const parsed = JSON.parse(note.content);
        if (parsed.segments && parsed.segments[0]) {
          return parsed.segments[0].text;
        }
      } catch (e) {
        // If parsing fails, use content as-is
      }
    }

    // For user notes or fallback, use the content directly
    const contentToUse = note.content;
    return contentToUse.length > 100 ? contentToUse.substring(0, 100) + '...' : contentToUse;
  };

  // If we're in editing mode and showing only notes, show the editor
  if (isEditingMode && showOnlyNotes) {
    return (
      <div className="h-full flex flex-col overflow-hidden bg-white">
        <NoteEditor 
          note={editingNote || undefined} 
          onSave={handleSaveNote} 
          onDelete={editingNote ? handleDeleteNote : undefined} 
          onCancel={handleCancel} 
          isLoading={isCreating || isUpdating || isDeleting} 
          onCitationClick={onCitationClick} 
        />
      </div>
    );
  }

  // Show only audio section
  if (showOnlyAudio) {
    return (
      <div className="h-full flex flex-col overflow-hidden bg-white">
        <div className="flex-1 overflow-auto p-4">
          {hasValidAudio && !audioError && currentStatus !== 'generating' && !isAutoRefreshing ? (
            <AudioPlayer 
              audioUrl={notebook.audio_overview_url} 
              title="שיחת צלילה עמוקה" 
              notebookId={notebookId} 
              expiresAt={notebook.audio_url_expires_at} 
              onError={handleAudioError} 
              onRetry={handleAudioRetry} 
              onDeleted={handleAudioDeleted}
              onUrlRefresh={handleUrlRefresh}
            />
          ) : (
            <div className="space-y-4">
              {/* Audio Preview Card */}
              {currentStatus !== 'generating' && !isGenerating && !isAutoRefreshing && (
                <Card className="p-4 bg-white border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Headphones className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">שיחת צלילה עמוקה</h4>
                      <p className="text-sm text-gray-600">שני מנחים</p>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Status Display */}
              {getStatusDisplay() && (
                <Card className="p-4 bg-white border border-gray-200">
                  <div className="flex items-center space-x-2">
                    {getStatusDisplay()!.icon}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{getStatusDisplay()!.text}</p>
                      <p className="text-xs text-gray-600">{getStatusDisplay()!.description}</p>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Audio error */}
              {audioError && (
                <Card className="p-4 bg-red-50 border border-red-200">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm text-red-600">אודיו לא זמין</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleAudioRetry} className="text-red-600 border-red-300 hover:bg-red-50">
                      <RefreshCw className="h-4 w-4 ml-1" />
                      נסה שוב
                    </Button>
                  </div>
                </Card>
              )}
              
              <Button 
                onClick={handleGenerateAudio} 
                disabled={isGenerating || currentStatus === 'generating' || !hasProcessedSource || isAutoRefreshing} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isGenerating || currentStatus === 'generating' ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    יוצר...
                  </>
                ) : (
                  'צור אודיו'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show only notes section
  if (showOnlyNotes) {
    return (
      <div className="h-full flex flex-col overflow-hidden bg-white">
        <div className="p-4 border-b border-gray-100">
          <Button variant="outline" size="sm" className="w-full" onClick={handleCreateNote}>
            <Plus className="h-4 w-4 ml-2" />
            הוסף הערה
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600">טוען הערות...</p>
              </div>
            ) : notes && notes.length > 0 ? (
              notes.map(note => (
                <Card key={note.id} className="p-3 border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => handleEditNote(note)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {note.source_type === 'ai_response' ? (
                          <Bot className="h-3 w-3 text-blue-600" />
                        ) : (
                          <User className="h-3 w-3 text-gray-600" />
                        )}
                        <span className="text-xs text-gray-500 uppercase">
                          {note.source_type === 'ai_response' ? 'תגובת AI' : 'הערה'}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 truncate">{note.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {getPreviewText(note)}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(note.updated_at).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                    {note.source_type === 'user' && (
                      <Button variant="ghost" size="sm" className="mr-2">
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-400 text-2xl">📄</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">הערות שמורות יופיעו כאן</h3>
                <p className="text-sm text-gray-600">
                  שמור הודעת צ'אט כדי ליצור הערה חדשה, או לחץ על הוסף הערה למעלה.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Default full sidebar (when not split)
  return (
    <div className="w-full bg-white flex flex-col h-full overflow-hidden">
      {/* Clean Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">סטודיו</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Audio Overview Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Headphones className="h-5 w-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">סקירת אודיו</h3>
            </div>

            {hasValidAudio && !audioError && currentStatus !== 'generating' && !isAutoRefreshing ? (
              <AudioPlayer 
                audioUrl={notebook.audio_overview_url} 
                title="שיחת צלילה עמוקה" 
                notebookId={notebookId} 
                expiresAt={notebook.audio_url_expires_at} 
                onError={handleAudioError} 
                onRetry={handleAudioRetry} 
                onDeleted={handleAudioDeleted}
                onUrlRefresh={handleUrlRefresh}
              />
            ) : (
              <div className="space-y-3">
                {/* Audio Preview Card */}
                {currentStatus !== 'generating' && !isGenerating && !isAutoRefreshing && (
                  <Card className="p-4 bg-gray-50 border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Headphones className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">שיחת צלילה עמוקה</h4>
                        <p className="text-sm text-gray-600">שני מנחים</p>
                      </div>
                    </div>
                  </Card>
                )}
                
                {/* Status Display */}
                {getStatusDisplay() && (
                  <Card className="p-3 bg-blue-50 border-0">
                    <div className="flex items-center space-x-2">
                      {getStatusDisplay()!.icon}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">{getStatusDisplay()!.text}</p>
                        <p className="text-xs text-blue-700">{getStatusDisplay()!.description}</p>
                      </div>
                    </div>
                  </Card>
                )}
                
                {/* Audio error */}
                {audioError && (
                  <Card className="p-3 bg-red-50 border-0">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <div className="flex-1">
                        <p className="text-sm text-red-600">אודיו לא זמין</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={handleAudioRetry} className="text-red-600 border-red-300 hover:bg-red-50">
                        <RefreshCw className="h-4 w-4 ml-1" />
                        נסה שוב
                      </Button>
                    </div>
                  </Card>
                )}
                
                <Button 
                  onClick={handleGenerateAudio} 
                  disabled={isGenerating || currentStatus === 'generating' || !hasProcessedSource || isAutoRefreshing} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isGenerating || currentStatus === 'generating' ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      יוצר...
                    </>
                  ) : (
                    'צור אודיו'
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">הערות</h3>
              <Button variant="outline" size="sm" onClick={handleCreateNote}>
                <Plus className="h-4 w-4 ml-2" />
                הוסף
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600">טוען הערות...</p>
              </div>
            ) : notes && notes.length > 0 ? (
              <div className="space-y-3">
                {notes.map(note => (
                  <Card key={note.id} className="p-3 border-0 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => handleEditNote(note)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {note.source_type === 'ai_response' ? (
                            <Bot className="h-3 w-3 text-blue-600" />
                          ) : (
                            <User className="h-3 w-3 text-gray-600" />
                          )}
                          <span className="text-xs text-gray-500 uppercase">
                            {note.source_type === 'ai_response' ? 'תגובת AI' : 'הערה'}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 truncate">{note.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {getPreviewText(note)}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(note.updated_at).toLocaleDateString('he-IL')}
                        </p>
                      </div>
                      {note.source_type === 'user' && (
                        <Button variant="ghost" size="sm" className="mr-2">
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center bg-gray-50 border-0">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <span className="text-gray-400 text-xl">📄</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">הערות שמורות יופיעו כאן</h4>
                <p className="text-sm text-gray-600">
                  שמור הודעת צ'אט כדי ליצור הערה חדשה
                </p>
              </Card>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default StudioSidebar;