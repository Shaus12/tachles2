import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Plus, FileText, User, Bot, ChevronLeft, ChevronRight } from 'lucide-react';
import NoteEditor from './NoteEditor';
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

  // כל הפריטים: הערות קיימות + אפשרות ליצירת הערה חדשה
  const allItems = [
    ...notes,
    { id: 'new-note', isNewNote: true }
  ];

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
      } else {
        // האינדקס האחרון הוא ליצירת הערה חדשה
        setSelectedNote(null);
        setIsCreatingNote(true);
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
    <div className="flex-1 overflow-hidden p-4 flex flex-col">
      {/* Header with navigation info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            {isCreatingNote ? 'הערה חדשה' : `הערה ${current + 1} מתוך ${notes.length}`}
          </span>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => api?.scrollPrev()}
            disabled={!api?.canScrollPrev()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => api?.scrollNext()}
            disabled={!api?.canScrollNext()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

                    {/* Carousel */}
       <Carousel 
         setApi={setApi}
         className="flex-1 overflow-hidden"
         opts={{
           align: "start",
           direction: "rtl"
         }}
       >
         <CarouselContent className="h-full">
           {/* רכיבי הערות קיימות */}
           {notes.map((note) => (
             <CarouselItem key={note.id} className="h-full">
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
                   <Card className="h-full border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                         onClick={() => {
                           setSelectedNote(note);
                           setIsCreatingNote(false);
                         }}>
                     <div className="p-4 h-full flex flex-col">
                       <div className="flex items-center space-x-2 mb-2">
                         {note.source_type === 'ai_response' ? (
                           <Bot className="h-4 w-4 text-blue-600" />
                         ) : (
                           <User className="h-4 w-4 text-gray-600" />
                         )}
                         <span className="text-xs text-gray-500 uppercase">
                           {note.source_type === 'ai_response' ? 'תגובת AI' : 'הערה'}
                         </span>
                       </div>
                       
                       <h3 className="font-medium text-gray-900 mb-2">{note.title}</h3>
                       <div className="text-sm text-gray-600 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                         <div className="whitespace-pre-wrap">
                           {getPreviewText(note)}
                         </div>
                       </div>
                       
                       <div className="mt-4 pt-2 border-t border-gray-100 flex-shrink-0">
                         <p className="text-xs text-gray-500">
                           {new Date(note.updated_at).toLocaleDateString('he-IL')}
                         </p>
                       </div>
                     </div>
                   </Card>
                 )}
               </div>
             </CarouselItem>
           ))}
           
           {/* רכיב יצירת הערה חדשה */}
           <CarouselItem key="new-note" className="h-full">
             <div className="h-full p-2">
               {isCreatingNote ? (
                 <NoteEditor 
                   note={null}
                   onSave={onNoteSave}
                   onDelete={undefined}
                   onCancel={handleNoteCancel}
                   isLoading={isCreating || isUpdating || isDeleting}
                 />
               ) : (
                 <Card className="h-full border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center"
                       onClick={() => {
                         setSelectedNote(null);
                         setIsCreatingNote(true);
                       }}>
                   <div className="text-center">
                     <div className="w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                       <Plus className="h-8 w-8 text-blue-600" />
                     </div>
                     <h3 className="text-lg font-medium text-gray-900 mb-2">צור פתקית חדשה</h3>
                     <p className="text-sm text-gray-600">לחץ כדי להוסיף הערה חדשה</p>
                   </div>
                 </Card>
               )}
             </div>
           </CarouselItem>
         </CarouselContent>
       </Carousel>

      {/* Points indicator */}
      {allItems.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {allItems.map((_, index) => (
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
    </div>
  );
};

export default NotesCarousel; 