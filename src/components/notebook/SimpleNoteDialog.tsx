import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link,
  Save,
  X,
  Type,
  Undo,
  Redo
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SimpleNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (title: string, content: string) => void;
  isLoading?: boolean;
}

const SimpleNoteDialog = ({ open, onClose, onSave, isLoading }: SimpleNoteDialogProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  console.log('SimpleNoteDialog rendered with props:', { open, isLoading });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setTitle('');
      setContent('');
      setWordCount(0);
      setCharacterCount(0);
    }
  }, [open]);

  // Update word and character count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(content.trim() ? words : 0);
    setCharacterCount(content.length);
  }, [content]);

  const handleSave = () => {
    if (title.trim() && content.trim()) {
      onSave(title.trim(), content.trim());
      onClose();
    }
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    onClose();
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
    // Escape to close
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-6 bg-white border border-gray-300">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900">הערה חדשה</DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Title Input */}
          <div>
            <Input
              placeholder="כותרת ההערה..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium h-12"
            />
          </div>

          {/* Content Area */}
          <div>
            <Textarea
              ref={textareaRef}
              placeholder="כתוב את ההערה שלך כאן..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-[300px] text-lg leading-relaxed resize-none"
              autoFocus
            />
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{wordCount} מילים</span>
            <span>•</span>
            <span>{characterCount} תווים</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleCancel}
            >
              ביטול
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!title.trim() || !content.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 ml-2" />
              {isLoading ? 'שומר...' : 'שמור הערה'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleNoteDialog; 