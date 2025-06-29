import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { QuizQuestion } from './useQuizQuestions';

export type QuizAttempt = Tables<'quiz_attempts'>;
export type QuizSession = Tables<'quiz_sessions'>;

interface QuizSessionData {
  currentQuestion: number;
  questions: QuizQuestion[];
  answers: { [questionId: string]: string };
  correctAnswers: number;
  startTime: number;
  sessionId?: string;
}

export const useQuizSession = (notebookId?: string) => {
  const [sessionData, setSessionData] = useState<QuizSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startSession = useCallback(async (
    questions: QuizQuestion[], 
    sessionType: 'practice' | 'timed' | 'exam' = 'practice'
  ) => {
    if (!notebookId || questions.length === 0) return null;

    setIsLoading(true);
    
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // יצירת הפעלה חדשה בטבלה
      const { data: session, error } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: user.id,
          notebook_id: notebookId,
          session_type: sessionType,
          questions_count: questions.length,
          correct_answers: 0
        })
        .select()
        .single();

      if (error) throw error;

      // התחלת הפעלה מקומית
      const newSession: QuizSessionData = {
        currentQuestion: 0,
        questions,
        answers: {},
        correctAnswers: 0,
        startTime: Date.now(),
        sessionId: session.id
      };

      setSessionData(newSession);
      return session;
    } catch (err) {
      console.error('Error starting quiz session:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [notebookId]);

  const submitAnswer = useCallback(async (answer: string) => {
    if (!sessionData || !notebookId) return null;

    const currentQ = sessionData.questions[sessionData.currentQuestion];
    const isCorrect = answer === currentQ.correct_answer;

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // שמירת התשובה בטבלה
      const { data: attempt, error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          notebook_id: notebookId,
          question_id: currentQ.id,
          user_answer: answer,
          is_correct: isCorrect,
          time_taken: Math.floor((Date.now() - sessionData.startTime) / 1000)
        })
        .select()
        .single();

      if (error) throw error;

      // עדכון המצב המקומי
      const newAnswers = { ...sessionData.answers, [currentQ.id]: answer };
      const newCorrectAnswers = sessionData.correctAnswers + (isCorrect ? 1 : 0);

      setSessionData(prev => prev ? {
        ...prev,
        answers: newAnswers,
        correctAnswers: newCorrectAnswers
      } : null);

      return { attempt, isCorrect };
    } catch (err) {
      console.error('Error submitting answer:', err);
      throw err;
    }
  }, [sessionData, notebookId]);

  const nextQuestion = useCallback(() => {
    if (!sessionData) return false;

    if (sessionData.currentQuestion < sessionData.questions.length - 1) {
      setSessionData(prev => prev ? {
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      } : null);
      return true;
    }
    return false;
  }, [sessionData]);

  const finishSession = useCallback(async () => {
    if (!sessionData?.sessionId) return null;

    try {
      // עדכון הפעלה כהושלמה
      const totalTime = Math.floor((Date.now() - sessionData.startTime) / 1000);
      
      const { data, error } = await supabase
        .from('quiz_sessions')
        .update({
          correct_answers: sessionData.correctAnswers,
          total_time: totalTime,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionData.sessionId)
        .select()
        .single();

      if (error) throw error;

      return {
        session: data,
        score: sessionData.correctAnswers,
        totalQuestions: sessionData.questions.length,
        timeSpent: totalTime
      };
    } catch (err) {
      console.error('Error finishing quiz session:', err);
      throw err;
    }
  }, [sessionData]);

  const resetSession = useCallback(() => {
    setSessionData(null);
  }, []);

  return {
    sessionData,
    isLoading,
    startSession,
    submitAnswer,
    nextQuestion,
    finishSession,
    resetSession,
    isActive: !!sessionData,
    currentQuestion: sessionData?.questions[sessionData.currentQuestion] || null,
    progress: sessionData 
      ? ((sessionData.currentQuestion + 1) / sessionData.questions.length) * 100 
      : 0
  };
};