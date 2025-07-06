import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProgressChart from '@/components/dashboard/ProgressChart';
import { useProgressData } from '@/hooks/useProgressData';
import { Loader2 } from 'lucide-react';

interface ProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  notebookId?: string;
}

const ProgressDialog = ({ isOpen, onClose, notebookId }: ProgressDialogProps) => {
  const { data, isLoading, error } = useProgressData(notebookId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">מעקב התקדמות</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="mr-2 text-gray-600">טוען נתוני התקדמות...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            שגיאה בטעינת נתוני ההתקדמות: {error}
          </div>
        ) : (
          <ProgressChart data={data} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProgressDialog; 