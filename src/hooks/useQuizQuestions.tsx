import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type QuizQuestion = Tables<'quiz_questions'>;

export const useQuizQuestions = (notebookId?: string) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    if (!notebookId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('notebook_id', notebookId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (err) {
      console.error('Error fetching quiz questions:', err);
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת שאלות החידון');
    } finally {
      setIsLoading(false);
    }
  };

  const createQuestion = async (questionData: {
    question: string;
    correct_answer: string;
    question_type?: string;
    options?: any;
    explanation?: string;
    difficulty?: string;
    source_reference?: string;
  }) => {
    if (!notebookId) return null;

    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert({
          ...questionData,
          notebook_id: notebookId
        })
        .select()
        .single();

      if (error) throw error;
      
      // רענון רשימת השאלות
      fetchQuestions();
      return data;
    } catch (err) {
      console.error('Error creating quiz question:', err);
      throw err;
    }
  };

  const getRandomQuestions = (count: number = 10, difficulty?: string) => {
    let filteredQuestions = questions;
    
    if (difficulty) {
      filteredQuestions = questions.filter(q => q.difficulty === difficulty);
    }
    
    // ערבוב השאלות והחזרת מספר מוגבל
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };

  useEffect(() => {
    fetchQuestions();
  }, [notebookId]);

  return {
    questions,
    isLoading,
    error,
    fetchQuestions,
    createQuestion,
    getRandomQuestions,
    hasQuestions: questions.length > 0
  };
}; 