-- ============================================================================
-- QUIZ SYSTEM MIGRATION
-- This migration adds quiz functionality to the application
-- ============================================================================

-- Create quiz questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    notebook_id uuid NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
    question text NOT NULL,
    question_type text DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'open_ended')),
    options jsonb DEFAULT '[]', -- Array of answer options for multiple choice
    correct_answer text NOT NULL,
    explanation text,
    difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    source_reference text, -- Reference to source material
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create quiz attempts table to track user progress
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    notebook_id uuid NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
    question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    user_answer text NOT NULL,
    is_correct boolean NOT NULL,
    time_taken integer, -- Time in seconds
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create quiz sessions table for tracking game sessions
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    notebook_id uuid NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
    session_type text DEFAULT 'practice' CHECK (session_type IN ('practice', 'timed', 'exam')),
    questions_count integer NOT NULL DEFAULT 10,
    correct_answers integer DEFAULT 0,
    total_time integer, -- Total time in seconds
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
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
DROP POLICY IF EXISTS "Users can view quiz questions from their notebooks" ON public.quiz_questions;
CREATE POLICY "Users can view quiz questions from their notebooks"
    ON public.quiz_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.notebooks 
            WHERE notebooks.id = quiz_questions.notebook_id 
            AND notebooks.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create quiz questions in their notebooks" ON public.quiz_questions;
CREATE POLICY "Users can create quiz questions in their notebooks"
    ON public.quiz_questions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.notebooks 
            WHERE notebooks.id = quiz_questions.notebook_id 
            AND notebooks.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update quiz questions in their notebooks" ON public.quiz_questions;
CREATE POLICY "Users can update quiz questions in their notebooks"
    ON public.quiz_questions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.notebooks 
            WHERE notebooks.id = quiz_questions.notebook_id 
            AND notebooks.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete quiz questions from their notebooks" ON public.quiz_questions;
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
DROP POLICY IF EXISTS "Users can view their own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can view their own quiz attempts"
    ON public.quiz_attempts FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can create their own quiz attempts"
    ON public.quiz_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Quiz sessions policies
DROP POLICY IF EXISTS "Users can view their own quiz sessions" ON public.quiz_sessions;
CREATE POLICY "Users can view their own quiz sessions"
    ON public.quiz_sessions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own quiz sessions" ON public.quiz_sessions;
CREATE POLICY "Users can create their own quiz sessions"
    ON public.quiz_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own quiz sessions" ON public.quiz_sessions;
CREATE POLICY "Users can update their own quiz sessions"
    ON public.quiz_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Create updated_at triggers for quiz tables
CREATE TRIGGER update_quiz_questions_updated_at
    BEFORE UPDATE ON public.quiz_questions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- REALTIME CONFIGURATION
-- ============================================================================

-- Enable realtime for quiz tables
ALTER TABLE public.quiz_questions REPLICA IDENTITY FULL;
ALTER TABLE public.quiz_attempts REPLICA IDENTITY FULL;
ALTER TABLE public.quiz_sessions REPLICA IDENTITY FULL;

-- Add quiz tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_sessions; 