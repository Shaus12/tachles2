import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Globe, Video, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotebooks } from '@/hooks/useNotebooks';
import FadeIn from '@/components/ui/FadeIn';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer';

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

  const featureCards = [
    {
      icon: FileText,
      title: 'קבצי PDF',
      description: 'העלה מאמרי מחקר, דוחות ומסמכים',
      color: 'blue'
    },
    {
      icon: Globe,
      title: 'אתרי אינטרנט',
      description: 'הוסף דפי אינטרנט ומאמרים מקוונים כמקורות',
      color: 'green'
    },
    {
      icon: Video,
      title: 'אודיו',
      description: 'כלול תוכן מולטימדיה במחקר שלך',
      color: 'purple'
    }
  ];

  return (
    <div className="text-center py-16">
      <FadeIn direction="up" className="mb-12">
        <motion.h2 
          className="text-3xl font-medium text-gray-900 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          צור את המחברת הראשונה שלך
        </motion.h2>
        <motion.p 
          className="text-lg text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          TachlesAI הוא עוזר מחקר וכתיבה מבוסס בינה מלאכותית שעובד הכי טוב עם המקורות שאתה מעלה
        </motion.p>
      </FadeIn>

      <StaggerContainer staggerDelay={0.2} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
        {featureCards.map((card, index) => (
          <StaggerItem key={index}>
            <motion.div 
              className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:border-gray-300 transition-colors duration-300"
              whileHover={{ 
                y: -5,
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div 
                className={`w-12 h-12 bg-${card.color}-100 rounded-lg mx-auto mb-4 flex items-center justify-center`}
                whileHover={{ 
                  scale: 1.1,
                  rotate: 360
                }}
                transition={{ duration: 0.6 }}
              >
                <card.icon className={`h-6 w-6 text-${card.color}-600`} />
              </motion.div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{card.title}</h3>
              <p className="text-gray-600">{card.description}</p>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <FadeIn direction="up" delay={0.8}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={handleCreateNotebook} 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700" 
            disabled={isCreating}
          >
            <motion.div
              animate={isCreating ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 1, repeat: isCreating ? Infinity : 0 }}
            >
              <Upload className="h-5 w-5 mr-2" />
            </motion.div>
            {isCreating ? 'יוצר...' : 'צור מחברת'}
          </Button>
        </motion.div>
      </FadeIn>
    </div>
  );
};

export default EmptyDashboard;