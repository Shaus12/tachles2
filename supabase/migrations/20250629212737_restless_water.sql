/*
  # Quiz System Migration
  
  1. New Tables
    - `quiz_questions` - Stores quiz questions for notebooks
    - `quiz_attempts` - Tracks user attempts at answering questions
    - `quiz_sessions` - Manages quiz game sessions
  
  2. Security
    - Enable RLS on all quiz tables
    - Add policies for users to manage their own quiz data
    
  3. Indexing
    - Add appropriate indexes for performance
*/

-- Create quiz questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id uuid REFERENCES public.sources(id) ON DELETE CASCADE,
    notebook_id uuid REFERENCES public.notebooks(id) ON DELETE CASCADE,
    question text NOT NULL,
    correct_answer text NOT NULL,
    wrong_answer_1 text NOT NULL,
    wrong_answer_2 text NOT NULL,
    wrong_answer_3 text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Add additional columns to quiz_questions
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS question_type text DEFAULT 'multiple_choice',
ADD COLUMN IF NOT EXISTS options jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS explanation text,
ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS source_reference text;

-- Create quiz attempts table to track user progress
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    notebook_id uuid NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
    question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    user_answer text NOT NULL,
    is_correct boolean NOT NULL,
    time_taken integer, -- Time in seconds
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create quiz sessions table for tracking game sessions
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    notebook_id uuid NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
    session_type text DEFAULT 'practice',
    questions_count integer NOT NULL DEFAULT 10,
    correct_answers integer DEFAULT 0,
    total_time integer, -- Total time in seconds
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index for quiz questions by notebook
CREATE INDEX IF NOT EXISTS idx_quiz_questions_notebook_id ON public.quiz_questions(notebook_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON public.quiz_questions(difficulty);

-- Index for quiz attempts by user and notebook
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_notebook_id ON public.quiz_attempts(notebook_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_question_id ON public.quiz_attempts(question_id);

-- Index for quiz sessions by user and notebook
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_notebook_id ON public.quiz_sessions(notebook_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on quiz tables
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Quiz questions policies
CREATE POLICY "Users can view quiz questions from their notebooks"
    ON public.quiz_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.notebooks 
            WHERE notebooks.id = quiz_questions.notebook_id 
            AND notebooks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create quiz questions in their notebooks"
    ON public.quiz_questions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.notebooks 
            WHERE notebooks.id = quiz_questions.notebook_id 
            AND notebooks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update quiz questions in their notebooks"
    ON public.quiz_questions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.notebooks 
            WHERE notebooks.id = quiz_questions.notebook_id 
            AND notebooks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete quiz questions from their notebooks"
    ON public.quiz_questions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.notebooks 
            WHERE notebooks.id = quiz_questions.notebook_id 
            AND notebooks.user_id = auth.uid()
        )
    );

-- Quiz attempts policies
CREATE POLICY "Users can view their own quiz attempts"
    ON public.quiz_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz attempts"
    ON public.quiz_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Quiz sessions policies
CREATE POLICY "Users can view their own quiz sessions"
    ON public.quiz_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz sessions"
    ON public.quiz_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz sessions"
    ON public.quiz_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- REALTIME CONFIGURATION
-- ============================================================================

-- Enable realtime for quiz tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_sessions;