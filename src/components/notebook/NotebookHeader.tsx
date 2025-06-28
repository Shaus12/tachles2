import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, LogOut, ChevronRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotebookUpdate } from '@/hooks/useNotebookUpdate';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogout } from '@/services/authService';
import Logo from '@/components/ui/Logo';

interface NotebookHeaderProps {
  title: string;
  notebookId?: string;
  onSourcesClick?: () => void;
  sourcesCount?: number;
}

const NotebookHeader = ({ title, notebookId, onSourcesClick, sourcesCount }: NotebookHeaderProps) => {
  const navigate = useNavigate();
  const { logout } = useLogout();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const { updateNotebook, isUpdating } = useNotebookUpdate();
  const isDesktop = useIsDesktop();

  const handleTitleClick = () => {
    if (notebookId) {
      setIsEditing(true);
      setEditedTitle(title);
    }
  };

  const handleTitleSubmit = () => {
    if (notebookId && editedTitle.trim() && editedTitle !== title) {
      updateNotebook({
        id: notebookId,
        updates: { title: editedTitle.trim() }
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setEditedTitle(title);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleTitleSubmit();
  };

  const handleBackToDashboard = () => {
    navigate('/app');
  };

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToDashboard}
            className="flex items-center text-gray-600 hover:text-gray-900 p-2"
          >
            <ChevronRight className="h-5 w-5 ml-1" />
            <Logo size="sm" />
          </Button>
          
          {isEditing ? (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              className="text-lg font-medium text-gray-900 border-none shadow-none p-0 h-auto focus-visible:ring-1 min-w-[300px] w-auto"
              autoFocus
              disabled={isUpdating}
            />
          ) : (
            <span 
              className="text-lg font-medium text-gray-900 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors"
              onClick={handleTitleClick}
            >
              {title}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Sources button - only show on desktop */}
          {isDesktop && onSourcesClick && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onSourcesClick}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <FileText className="h-4 w-4 ml-2" />
              מקורות
              {sourcesCount && sourcesCount > 0 && (
                <span className="mr-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {sourcesCount}
                </span>
              )}
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="h-4 w-4 ml-2" />
                התנתק
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default NotebookHeader;