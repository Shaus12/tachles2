import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Trash2, 
  Save, 
  X, 
  Wand2, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Type, 
  Sparkles,
  Eye,
  Edit3,
  Calendar,
  Clock
} from 'lucide-react';
import { Note } from '@/hooks/useNotes';
import MarkdownRenderer from '@/components/chat/MarkdownRenderer';
import { Citation } from '@/types/message';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

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
  const [isEditing, setIsEditing] = useState(!note); // Only edit mode for new notes
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
    setIsEditing(!note); // Only edit mode for new notes
  }, [note]);

  // Update word and character count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(content.trim() ? words : 0);
    setCharacterCount(content.length);
  }, [content]);

  // Auto-save functionality
  useEffect(() => {
    if (title.trim() && content.trim() && isEditing) {
      // Clear existing timer
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      // Set new timer for auto-save after 3 seconds of inactivity
      const timer = setTimeout(() => {
        if (title.trim() && content.trim()) {
          onSave(title.trim(), content.trim());
          setLastSaved(new Date());
        }
      }, 3000);
      
      setAutoSaveTimer(timer);
    }
    
    // Cleanup timer on unmount
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [title, content, isEditing, autoSaveTimer, onSave]);

  const handleSave = () => {
    if (title.trim() && content.trim()) {
      onSave(title.trim(), content.trim());
      setLastSaved(new Date());
    }
  };

  const handleEdit = () => {
    console.log('NoteEditor: Attempting to edit note:', note?.id, 'source_type:', note?.source_type);
    if (note?.source_type === 'ai_response') {
      console.log('NoteEditor: Cannot edit AI response note');
      return;
    }
    console.log('NoteEditor: Switching to edit mode');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      // AI response notes stay in view mode, user notes can be cancelled to view mode
      setIsEditing(false);
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

  // Formatting functions
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const beforeSelection = content.substring(0, start);
    const afterSelection = content.substring(end);
    
    const newText = beforeSelection + prefix + selectedText + suffix + afterSelection;
    setContent(newText);
    
    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    // Ctrl+B for bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      insertFormatting('**', '**');
    }
    // Ctrl+I for italic
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      insertFormatting('*', '*');
    }
  };

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

  console.log('NoteEditor render:', {
    noteId: note?.id,
    sourceType: note?.source_type,
    isEditing,
    isAIResponse,
    hasNote: !!note
  });

  if (!isEditing && note) {
    // Enhanced View Mode
    return (
      <Card className="h-full max-h-[380px] border-0 shadow-none bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Enhanced Header */}
          <div className="p-6 border-b border-gray-100 flex-shrink-0 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {isAIResponse ? 'תגובת AI' : 'הערה'}
                  </h3>
                  <Badge variant={isAIResponse ? "secondary" : "default"} className="text-xs">
                    {isAIResponse ? 'נוצר על ידי AI' : 'הערה אישית'} • {note?.source_type}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!isAIResponse && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleEdit} 
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                    title={`ערוך הערה (סוג: ${note?.source_type})`}
                  >
                    <Edit3 className="h-4 w-4 ml-2" />
                    ערוך הערה
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onCancel} className="hover:bg-gray-100">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
            
            {/* Metadata */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {note?.created_at && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(note.created_at).toLocaleDateString('he-IL')}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Type className="w-4 h-4" />
                <span>{content.split(' ').filter(word => word.length > 0).length} מילים</span>
              </div>
            </div>
          </div>

                     {/* Enhanced Content Area */}
           <div className="flex-1 max-h-[180px] overflow-y-auto p-6 bg-gradient-to-b from-transparent to-gray-50/30">
            <div className="max-w-none prose prose-lg prose-gray prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900">
              {isAIResponse && typeof parsedContent === 'object' ? (
                <MarkdownRenderer 
                  content={parsedContent}
                  className="prose max-w-none"
                  onCitationClick={onCitationClick}
                />
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed text-gray-700 text-lg">
                  {typeof parsedContent === 'string' ? parsedContent : content}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="p-6 border-t border-gray-100 flex-shrink-0 bg-white/80 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <div>
                {note && onDelete && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={onDelete}
                    disabled={isLoading}
                    className="hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    מחק הערה
                  </Button>
                )}
              </div>
              <div className="text-xs text-gray-500 flex items-center space-x-2">
                <Clock className="w-3 h-3" />
                <span>עודכן לאחרונה: {note?.updated_at ? new Date(note.updated_at).toLocaleString('he-IL') : 'לא ידוע'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

      // Enhanced Edit Mode
    return (
      <Card className="h-full max-h-[380px] border-0 shadow-lg bg-white">
      <CardContent className="p-0 h-full flex flex-col">
        {/* Enhanced Header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {note ? 'עריכת הערה' : 'הערה חדשה'}
                </h3>
                <p className="text-sm text-gray-600">
                  {note ? 'ערוך את ההערה שלך' : 'צור הערה חדשה למחברת'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleSave}
                disabled={!title.trim() || !content.trim() || isLoading}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
              >
                <Save className="h-4 w-4 ml-2" />
                {isLoading ? 'שומר...' : 'שמור הערה'}
              </Button>

              <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="hover:bg-gray-100">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">כותרת ההערה</label>
            <div className="flex space-x-2">
              <Input
                placeholder="הזן כותרת מעניינת להערה..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 h-12 text-lg font-medium border-2 border-gray-200 focus:border-blue-500 transition-colors"
              />
              {isAIResponse && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleGenerateTitle}
                  disabled={isGeneratingTitle}
                  className="h-12 px-4 hover:bg-blue-50"
                >
                  <Wand2 className="h-4 w-4 ml-2" />
                  {isGeneratingTitle ? 'יוצר...' : 'צור כותרת'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Formatting Toolbar */}
        {(
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('**', '**')}
                  className="h-8 w-8 p-0 hover:bg-blue-100"
                  title="עב (Ctrl+B)"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('*', '*')}
                  className="h-8 w-8 p-0 hover:bg-blue-100"
                  title="נטוי (Ctrl+I)"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('- ')}
                  className="h-8 w-8 p-0 hover:bg-blue-100"
                  title="רשימה"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('1. ')}
                  className="h-8 w-8 p-0 hover:bg-blue-100"
                  title="רשימה ממוספרת"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('> ')}
                  className="h-8 w-8 p-0 hover:bg-blue-100"
                  title="ציטוט"
                >
                  <Quote className="h-4 w-4" />
                </Button>
              </div>
              
                             <div className="flex items-center space-x-2 text-sm text-gray-500">
                 <span>{wordCount} מילים</span>
                 <span>•</span>
                 <span>{characterCount} תווים</span>
                 {autoSaveTimer && (
                   <>
                     <span>•</span>
                     <span className="text-blue-600 animate-pulse">שומר בקרוב...</span>
                   </>
                 )}
                 {lastSaved && !autoSaveTimer && (
                   <>
                     <span>•</span>
                     <span className="text-green-600">נשמר ב-{lastSaved.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
                   </>
                 )}
               </div>
            </div>
          </div>
        )}

                          {/* Content Area */}
         <div className="flex-1 p-6 overflow-hidden">
           <Textarea
             ref={textareaRef}
             placeholder="התחל לכתוב את ההערה שלך כאן... &#10;&#10;💡 טיפים:&#10;• השתמש ב-Ctrl+S לשמירה מהירה&#10;• השתמש ב-Ctrl+B לטקסט מודגש&#10;• השתמש ב-Ctrl+I לטקסט נטוי&#10;&#10;אפשר להשתמש בעיצוב Markdown!"
             value={content}
             onChange={(e) => setContent(e.target.value)}
             onKeyDown={handleKeyDown}
             className="w-full h-full resize-none border-2 border-gray-200 rounded-xl p-6 text-lg leading-relaxed focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all duration-200 placeholder:text-gray-400 placeholder:italic"
             style={{ 
               minHeight: '140px',
               maxHeight: '180px',
               fontFamily: '"Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
             }}
           />
         </div>

        {/* Enhanced Footer */}
        <div className="p-6 border-t border-gray-100 flex-shrink-0 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {note && onDelete && !isAIResponse && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={onDelete}
                  disabled={isLoading}
                  className="hover:bg-red-600 shadow-sm"
                >
                  <Trash2 className="h-4 w-4 ml-2" />
                  מחק הערה
                </Button>
              )}
              
              <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
                Ctrl+S לשמירה מהירה
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${title.trim() && content.trim() ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>{title.trim() && content.trim() ? 'מוכן לשמירה' : 'השלם מילוי כדי לשמור'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteEditor;