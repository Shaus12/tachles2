import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Globe, Video, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotebooks } from '@/hooks/useNotebooks';

const EmptyDashboard = () => {
  const navigate = useNavigate();
  const {
    createNotebook,
    isCreating
  } = useNotebooks();

  const handleCreateNotebook = () => {
    console.log('Create notebook button clicked');
    console.log('isCreating:', isCreating);
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

  return (
    <div className="text-center py-16">
      <div className="mb-12">
        <h2 className="text-3xl font-medium text-gray-900 mb-4">צור את המחברת הראשונה שלך</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">TachlesAI הוא עוזר מחקר וכתיבה מבוסס בינה מלאכותית שעובד הכי טוב עם המקורות שאתה מעלה</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">קבצי PDF</h3>
          <p className="text-gray-600">העלה מאמרי מחקר, דוחות ומסמכים</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Globe className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">אתרי אינטרנט</h3>
          <p className="text-gray-600">הוסף דפי אינטרנט ומאמרים מקוונים כמקורות</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Video className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">אודיו</h3>
          <p className="text-gray-600">כלול תוכן מולטימדיה במחקר שלך</p>
        </div>
      </div>

      <Button onClick={handleCreateNotebook} size="lg" className="bg-blue-600 hover:bg-blue-700" disabled={isCreating}>
        <Upload className="h-5 w-5 mr-2" />
        {isCreating ? 'יוצר...' : 'צור מחברת'}
      </Button>
    </div>
  );
};

export default EmptyDashboard;