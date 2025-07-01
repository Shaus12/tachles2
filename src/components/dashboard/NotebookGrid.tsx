import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NotebookCard from './NotebookCard';
import { Check, Grid3X3, List, ChevronDown } from 'lucide-react';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useNavigate } from 'react-router-dom';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer';
import FadeIn from '@/components/ui/FadeIn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NotebookGrid = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('הכי חדש');
  const {
    notebooks,
    isLoading,
    createNotebook,
    isCreating
  } = useNotebooks();
  const navigate = useNavigate();

  const sortedNotebooks = useMemo(() => {
    if (!notebooks) return [];
    
    const sorted = [...notebooks];
    
    if (sortBy === 'הכי חדש') {
      return sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    } else if (sortBy === 'כותרת') {
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return sorted;
  }, [notebooks, sortBy]);

  const handleCreateNotebook = () => {
    createNotebook({
      title: 'מחברת ללא כותרת',
      description: ''
    }, {
      onSuccess: data => {
        console.log('Navigating to notebook:', data.id);
        navigate(`/notebook/${data.id}`);
      },
      onError: error => {
        console.error('Failed to create notebook:', error);
      }
    });
  };

  const handleNotebookClick = (notebookId: string, e: React.MouseEvent) => {
    // Check if the click is coming from a delete action or other interactive element
    const target = e.target as HTMLElement;
    const isDeleteAction = target.closest('[data-delete-action="true"]') || target.closest('.delete-button') || target.closest('[role="dialog"]');
    if (isDeleteAction) {
      console.log('Click prevented due to delete action');
      return;
    }
    navigate(`/notebook/${notebookId}`);
  };

  if (isLoading) {
    return (
      <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <StaggerItem key={index}>
            <motion.div 
              className="bg-gray-200 rounded-xl h-48 p-4"
              initial={{ opacity: 0.6 }}
              animate={{ 
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.02, 1]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                delay: index * 0.1
              }}
            >
              <div className="h-6 bg-gray-300 rounded mb-3 animate-pulse" />
              <div className="h-4 bg-gray-300 rounded mb-2 animate-pulse" />
              <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse" />
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <FadeIn direction="left">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              className="bg-black hover:bg-gray-800 text-white rounded-full px-6" 
              onClick={handleCreateNotebook} 
              disabled={isCreating}
            >
              {isCreating ? 'יוצר...' : '+ צור חדש'}
            </Button>
          </motion.div>
        </FadeIn>
        
        <FadeIn direction="right" delay={0.2}>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div 
                  className="flex items-center space-x-2 bg-white rounded-lg border px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-sm text-gray-600">{sortBy}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setSortBy('הכי חדש')} className="flex items-center justify-between">
                  הכי חדש
                  {sortBy === 'הכי חדש' && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('כותרת')} className="flex items-center justify-between">
                  כותרת
                  {sortBy === 'כותרת' && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </FadeIn>
      </div>

      <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedNotebooks.map(notebook => (
          <StaggerItem key={notebook.id}>
            <motion.div 
              onClick={e => handleNotebookClick(notebook.id, e)}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer"
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <NotebookCard notebook={{
                id: notebook.id,
                title: notebook.title,
                date: new Date(notebook.updated_at).toLocaleDateString('he-IL', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }),
                sources: notebook.sources?.[0]?.count || 0,
                icon: notebook.icon || '📝',
                color: notebook.color || 'bg-gray-100'
              }} />
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
};

export default NotebookGrid;