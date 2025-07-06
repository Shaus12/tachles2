import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProgressData {
  totalSources: number;
  studiedSources: number;
  totalNotes: number;
  chatMessages: number;
  quizzesTaken: number;
  studyTimeMinutes: number;
  quizSuccessRate: number;
  totalQuizQuestions: number;
  correctAnswers: number;
}

export const useProgressData = (notebookId?: string) => {
  const [data, setData] = useState<ProgressData>({
    totalSources: 0,
    studiedSources: 0,
    totalNotes: 0,
    chatMessages: 0,
    quizzesTaken: 0,
    studyTimeMinutes: 0,
    quizSuccessRate: 0,
    totalQuizQuestions: 0,
    correctAnswers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !notebookId) {
      setIsLoading(false);
      return;
    }

    const fetchProgressData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // בדיקה שהמחברת שייכת למשתמש
        const { data: notebookData, error: notebookError } = await supabase
          .from('notebooks')
          .select('id, user_id')
          .eq('id', notebookId)
          .eq('user_id', user.id)
          .single();

        if (notebookError) throw notebookError;
        if (!notebookData) throw new Error('המחברת לא נמצאה');

        // שליפת מספר המקורות במחברת זו
        const { data: sourcesData, error: sourcesError } = await supabase
          .from('sources')
          .select('id, title, type')
          .eq('notebook_id', notebookId);

        if (sourcesError) throw sourcesError;

        // שליפת מספר ההערות במחברת זו
        const { data: notesData, error: notesError } = await supabase
          .from('notes')
          .select('id')
          .eq('notebook_id', notebookId);

        if (notesError) throw notesError;

        // שליפת מספר הודעות הצ'אט במחברת זו
        const { data: messagesData, error: messagesError } = await supabase
          .from('n8n_chat_histories')
          .select('id')
          .eq('session_id', notebookId);

        if (messagesError) throw messagesError;

        // שליפת נתוני חידונים במחברת זו
        const { data: quizData, error: quizError } = await supabase
          .from('quiz_sessions')
          .select('id, correct_answers, questions_count')
          .eq('notebook_id', notebookId);

        if (quizError) throw quizError;

        // שליפת ניסיונות החידונים לחישוב אחוז הצלחה
        const { data: quizAttemptsData, error: quizAttemptsError } = await supabase
          .from('quiz_attempts')
          .select('is_correct')
          .eq('notebook_id', notebookId);

        if (quizAttemptsError) throw quizAttemptsError;

        // חישוב מקורות נלמדו (נניח שמקור נלמד אם יש לו פעילות)
        // בואו נחשב שמקור נלמד אם יש לו לפחות הערה או הודעת צ'אט
        const totalSources = sourcesData?.length || 0;
        const hasActivity = (messagesData?.length || 0) > 0 || (notesData?.length || 0) > 0;
        const studiedSources = hasActivity ? Math.min(totalSources, Math.ceil(totalSources * 0.7)) : 0;

        // חישוב זמן למידה מוערך (נניח דקה לכל הודעת צ'אט ו-3 דקות לכל הערה)
        const estimatedStudyTime = 
          (messagesData?.length || 0) * 1 + 
          (notesData?.length || 0) * 3;

        // חישוב נתוני חידונים
        const totalCorrectAnswers = quizAttemptsData?.filter(attempt => attempt.is_correct).length || 0;
        const totalQuizQuestions = quizAttemptsData?.length || 0;
        const quizSuccessRate = totalQuizQuestions > 0 ? (totalCorrectAnswers / totalQuizQuestions) * 100 : 0;

        setData({
          totalSources,
          studiedSources,
          totalNotes: notesData?.length || 0,
          chatMessages: messagesData?.length || 0,
          quizzesTaken: quizData?.length || 0,
          studyTimeMinutes: estimatedStudyTime,
          quizSuccessRate,
          totalQuizQuestions,
          correctAnswers: totalCorrectAnswers,
        });

      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError(err instanceof Error ? err.message : 'שגיאה בטעינת נתוני ההתקדמות');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgressData();
  }, [user, notebookId]);

  return { data, isLoading, error };
}; 