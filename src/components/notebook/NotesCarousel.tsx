import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Plus, FileText, User, Bot, ChevronLeft, ChevronRight } from 'lucide-react';
import NoteEditor from './NoteEditor';
import SimpleNoteDialog from './SimpleNoteDialog';
import { Note } from '@/hooks/useNotes';
import type { CarouselApi } from '@/components/ui/carousel';

interface NotesCarouselProps {
  notes: Note[];
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onNoteSave: (title: string, content: string) => void;
  onNoteDelete: () => void;
  onCreateNote: () => void;
  selectedNote: Note | null;
  setSelectedNote: (note: Note | null) => void;
  isCreatingNote: boolean;
  setIsCreatingNote: (creating: boolean) => void;
}

const NotesCarousel = ({
  notes,
  isCreating,
  isUpdating,
  isDeleting,
  onNoteSave,
  onNoteDelete,
  onCreateNote,
  selectedNote,
  setSelectedNote,
  isCreatingNote,
  setIsCreatingNote
}: NotesCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [showNoteDialog, setShowNoteDialog] = useState(false);



  // כל הפריטים: הערות קיימות + אפשרות ליצירת הערה חדשה
  // רק הערות קיימות - הוספת הערה חדשה תהיה בכפתור נפרד
  const allItems = [...notes];



  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      const selectedIndex = api.selectedScrollSnap();
      setCurrent(selectedIndex);
      
      // עדכון ההערה הנבחרת בהתאם לאינדקס
      if (selectedIndex < notes.length) {
        setSelectedNote(notes[selectedIndex]);
        setIsCreatingNote(false);
      }
    });
  }, [api, notes, setSelectedNote, setIsCreatingNote]);

  // עדכון מיקום הקרוסלה כשהערה נבחרת חיצונית
  useEffect(() => {
    if (!api || !selectedNote) return;
    
    const noteIndex = notes.findIndex(note => note.id === selectedNote.id);
    if (noteIndex !== -1 && noteIndex !== current) {
      api.scrollTo(noteIndex);
    }
  }, [api, selectedNote, notes, current]);

  const handleNoteCancel = () => {
    setIsCreatingNote(false);
    if (notes.length > 0) {
      setSelectedNote(notes[0]);
      api?.scrollTo(0);
    } else {
      setSelectedNote(null);
    }
  };

  const handleCreateNewNote = () => {
    console.log('NotesCarousel: handleCreateNewNote clicked!');
    setShowNoteDialog(true);
  };

  const handleSaveFromDialog = (title: string, content: string) => {
    onNoteSave(title, content);
    setShowNoteDialog(false);
  };

  const getPreviewText = (note: Note) => {
    if (note.source_type === 'ai_response') {
      try {
        const parsed = JSON.parse(note.content);
        if (parsed.segments) {
          return parsed.segments.map((seg: any) => seg.text).join(' ');
        }
      } catch (e) {
        // Fall back to raw content
      }
    }
    return note.content;
  };

  if (allItems.length === 0) {
    return (
      <div className="flex-1 overflow-auto p-4 flex flex-col">
        <div className="flex items-center justify-center h-full">
          <Card className="p-8 text-center border-0 bg-gray-50">
            <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין הערות עדיין</h3>
            <p className="text-sm text-gray-600 mb-4">צור את ההערה הראשונה שלך</p>
            <Button onClick={onCreateNote} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 ml-2" />
              צור פתקית חדשה
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-h-[380px] overflow-hidden p-2 flex flex-col">
      {/* Header with navigation and add button */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            {notes.length > 0 ? `הערה ${current + 1} מתוך ${notes.length}` : 'אין הערות'}
          </span>
        </div>
        
        {/* Add Note Button */}
        <Button 
          onClick={handleCreateNewNote}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>הוספת הערה</span>
        </Button>
      </div>

                    {/* Carousel */}
       <Carousel 
         setApi={setApi}
         className="flex-1 max-h-[300px] overflow-hidden"
         opts={{
           align: "start",
           direction: "rtl"
         }}
       >
         <CarouselContent className="h-[280px]">
           {/* רכיבי הערות קיימות */}
           {notes.map((note) => (
             <CarouselItem key={note.id} className="h-[280px]">
               <div className="h-full p-2">
                 {selectedNote?.id === note.id && !isCreatingNote ? (
                   <NoteEditor 
                     note={note}
                     onSave={onNoteSave}
                     onDelete={onNoteDelete}
                     onCancel={handleNoteCancel}
                     isLoading={isCreating || isUpdating || isDeleting}
                   />
                 ) : (
                   <Card className="h-full border-2 border-gray-200 cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all duration-300 group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/30"
                         onClick={() => {
                           setSelectedNote(note);
                           setIsCreatingNote(false);
                         }}>
                     {/* Background overlay */}
                     <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/20 group-hover:to-purple-50/10 transition-all duration-300"></div>
                     
                     <div className="p-6 h-full flex flex-col relative z-10">
                       <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center space-x-2">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                             note.source_type === 'ai_response' 
                               ? 'bg-gradient-to-br from-blue-100 to-purple-100' 
                               : 'bg-gradient-to-br from-green-100 to-blue-100'
                           }`}>
                             {note.source_type === 'ai_response' ? (
                               <Bot className="h-4 w-4 text-blue-600" />
                             ) : (
                               <User className="h-4 w-4 text-green-600" />
                             )}
                           </div>
                           <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                             note.source_type === 'ai_response' 
                               ? 'bg-blue-100 text-blue-700' 
                               : 'bg-green-100 text-green-700'
                           }`}>
                             {note.source_type === 'ai_response' ? 'תגובת AI' : 'הערה אישית'}
                           </span>
                         </div>
                         <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                           {new Date(note.updated_at).toLocaleDateString('he-IL')}
                         </div>
                       </div>
                       
                       <h3 className="font-bold text-gray-900 mb-3 text-lg leading-tight group-hover:text-blue-900 transition-colors">{note.title}</h3>
                       <div className="text-sm text-gray-600 flex-grow max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                         <div className="whitespace-pre-wrap leading-relaxed">
                           {getPreviewText(note)}
                         </div>
                       </div>
                       
                       <div className="mt-4 pt-3 border-t border-gray-200 flex-shrink-0">
                         <div className="flex items-center justify-between">
                           <p className="text-xs text-gray-500 flex items-center">
                             <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                               <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                             </svg>
                             {new Date(note.created_at).toLocaleDateString('he-IL')}
                           </p>
                           <div className="flex items-center text-xs text-gray-400">
                             <span>{note.content.split(' ').filter(word => word.length > 0).length} מילים</span>
                           </div>
                         </div>
                       </div>
                     </div>
                   </Card>
                 )}
               </div>
             </CarouselItem>
           ))}
           

         </CarouselContent>
       </Carousel>

      {/* Points indicator */}
      {notes.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {notes.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === current ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      )}

      {/* Simple Note Dialog */}
      <SimpleNoteDialog 
        open={showNoteDialog}
        onClose={() => setShowNoteDialog(false)}
        onSave={handleSaveFromDialog}
        isLoading={isCreating}
      />
    </div>
  );
};

export default NotesCarousel; 