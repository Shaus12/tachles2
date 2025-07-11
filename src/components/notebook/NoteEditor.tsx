import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Save, X, Wand2 } from 'lucide-react';
import { Note } from '@/hooks/useNotes';
import MarkdownRenderer from '@/components/chat/MarkdownRenderer';
import { Citation } from '@/types/message';
import { supabase } from '@/integrations/supabase/client';

interface NoteEditorProps {
  note?: Note;
  onSave: (title: string, content: string) => void;
  onDelete?: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  onCitationClick?: (citation: Citation) => void;
}

const NoteEditor = ({ note, onSave, onDelete, onCancel, isLoading, onCitationClick }: NoteEditorProps) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  // AI response notes should NEVER be in edit mode - they're read-only
  const [isEditing, setIsEditing] = useState(!note || note.source_type === 'user');
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
    // AI response notes should NEVER be editable - they open in view mode
    setIsEditing(!note || note.source_type === 'user');
  }, [note]);

  const handleSave = () => {
    if (title.trim() && content.trim()) {
      onSave(title.trim(), content.trim());
    }
  };

  const handleEdit = () => {
    // Only allow editing of user notes, not AI responses
    if (note?.source_type === 'ai_response') {
      console.log('NoteEditor: Cannot edit AI response note');
      return;
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      // AI response notes should return to view mode, user notes can be cancelled
      setIsEditing(note.source_type === 'ai_response' ? false : false);
    } else {
      onCancel();
    }
  };

  const handleGenerateTitle = async () => {
    if (!note || note.source_type !== 'ai_response') return;
    
    setIsGeneratingTitle(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-note-title', {
        body: { content: note.content }
      });
      
      if (error) throw error;
      
      if (data?.title) {
        setTitle(data.title);
      }
    } catch (error) {
      console.error('Error generating title:', error);
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  // Parse AI response content if it's structured
  const parseContent = (contentStr: string) => {
    try {
      const parsed = JSON.parse(contentStr);
      if (parsed.segments && parsed.citations) {
        return parsed;
      }
    } catch (e) {
      // Not JSON, return as string
    }
    return contentStr;
  };

  const isAIResponse = note?.source_type === 'ai_response';
  const parsedContent = isAIResponse ? parseContent(content) : content;

  if (!isEditing && note) {
    // View mode for existing notes
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">
              {isAIResponse ? 'תגובת AI' : 'הערה'}
            </h3>
            <div className="flex items-center space-x-2">
              {!isAIResponse && (
                <Button variant="ghost" size="sm" onClick={handleEdit}>
                  ערוך
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {isAIResponse && typeof parsedContent === 'object' ? (
            <MarkdownRenderer 
              content={parsedContent}
              className="prose max-w-none"
              onCitationClick={onCitationClick}
            />
          ) : (
            <div className="whitespace-pre-wrap text-gray-700">{typeof parsedContent === 'string' ? parsedContent : content}</div>
          )}
        </div>

        {/* Footer - Always visible */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
          <div className="flex justify-between items-center">
            <div>
              {note && onDelete && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={onDelete}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 ml-2" />
                  מחק הערה
                </Button>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {note?.created_at && new Date(note.created_at).toLocaleDateString('he-IL')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode (only for user notes or new notes)
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">
            {note ? 'ערוך הערה' : 'הערה חדשה'}
          </h3>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleSave}
              disabled={!title.trim() || !content.trim() || isLoading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 ml-2" />
              {isLoading ? 'שומר...' : 'שמור הערה'}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Input
            placeholder="כותרת הערה"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1"
          />
          {isAIResponse && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGenerateTitle}
              disabled={isGeneratingTitle}
            >
              <Wand2 className="h-4 w-4 ml-2" />
              {isGeneratingTitle ? 'יוצר...' : 'צור כותרת'}
            </Button>
          )}
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 p-4 overflow-hidden">
        <Textarea
          placeholder="כתוב את ההערה שלך כאן..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full resize-none border border-gray-200 rounded-md p-3 focus-visible:ring-2 focus-visible:ring-blue-500 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        />
      </div>

      {/* Footer - Always visible */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
        <div className="flex justify-start items-center">
          <div>
            {note && onDelete && !isAIResponse && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={onDelete}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 ml-2" />
                מחק הערה
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;