import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Trophy, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { QuizQuestion } from '@/hooks/useQuizQuestions';
import { useQuizSession } from '@/hooks/useQuizSession';

interface QuizGameProps {
  questions: QuizQuestion[];
  notebookId: string;
  onComplete: (result: any) => void;
  onExit: () => void;
}

const QuizGame: React.FC<QuizGameProps> = ({ questions, notebookId, onComplete, onExit }) => {
  const {
    sessionData,
    currentQuestion,
    progress,
    startSession,
    submitAnswer,
    nextQuestion,
    finishSession,
    isLoading
  } = useQuizSession(notebookId);

  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [answerResult, setAnswerResult] = useState<{ isCorrect: boolean } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // התחלת המשחק
  useEffect(() => {
    if (questions.length > 0 && !sessionData) {
      startSession(questions, 'practice');
    }
  }, [questions, sessionData, startSession]);

  // טיימר (אופציונלי)
  useEffect(() => {
    if (timeRemaining && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleNextQuestion();
    }
  }, [timeRemaining]);

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentQuestion) return;

    try {
      const result = await submitAnswer(selectedAnswer);
      if (result) {
        setAnswerResult(result);
        setShowResult(true);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleNextQuestion = () => {
    const hasNext = nextQuestion();
    if (!hasNext) {
      handleFinishQuiz();
    } else {
      setSelectedAnswer('');
      setShowResult(false);
      setAnswerResult(null);
      setTimeRemaining(null); // או להגדיר זמן חדש לשאלה הבאה
    }
  };

  const handleFinishQuiz = async () => {
    try {
      const result = await finishSession();
      if (result) {
        onComplete(result);
      }
    } catch (error) {
      console.error('Error finishing quiz:', error);
    }
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading || !currentQuestion || !sessionData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">טוען משחק...</p>
        </div>
      </div>
    );
  }

  // Parse options safely with error handling
  let options: string[] = [];
  try {
    if (currentQuestion.options) {
      if (typeof currentQuestion.options === 'string') {
        options = JSON.parse(currentQuestion.options);
      } else if (Array.isArray(currentQuestion.options)) {
        options = currentQuestion.options;
      }
    }
  } catch (error) {
    console.error('Error parsing quiz options:', error);
    options = [];
  }

  // Ensure options is always an array
  if (!Array.isArray(options)) {
    options = [];
  }

  const isMultipleChoice = currentQuestion.question_type === 'multiple_choice' && options.length > 0;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header with progress and info */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              שאלה {sessionData.currentQuestion + 1} מתוך {sessionData.questions.length}
            </span>
            {currentQuestion.difficulty && (
              <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                {currentQuestion.difficulty === 'easy' ? 'קל' : 
                 currentQuestion.difficulty === 'medium' ? 'בינוני' : 'קשה'}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {timeRemaining && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {formatTime(timeRemaining)}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={onExit}>
              יציאה
            </Button>
          </div>
        </div>
        
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg text-right">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {isMultipleChoice ? (
            <div className="space-y-3">
              {options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === option ? 'default' : 'outline'}
                  className={`w-full text-right justify-start h-auto p-4 text-wrap ${
                    showResult && option === currentQuestion.correct_answer
                      ? 'bg-green-100 border-green-500 text-green-800'
                      : showResult && selectedAnswer === option && option !== currentQuestion.correct_answer
                      ? 'bg-red-100 border-red-500 text-red-800'
                      : ''
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                >
                  <span className="text-sm font-medium mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>סוג שאלה זה טרם נתמך</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Answer result */}
      {showResult && answerResult && (
        <Card className={`mb-6 ${answerResult.isCorrect ? 'border-green-200' : 'border-red-200'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              {answerResult.isCorrect ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <span className={`font-medium ${answerResult.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {answerResult.isCorrect ? 'תשובה נכונה!' : 'תשובה שגויה'}
              </span>
            </div>
            
            {!answerResult.isCorrect && (
              <p className="text-sm text-gray-600 mb-3">
                התשובה הנכונה: <span className="font-medium">{currentQuestion.correct_answer}</span>
              </p>
            )}
            
            {currentQuestion.explanation && (
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                <strong>הסבר:</strong> {currentQuestion.explanation}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Trophy className="w-4 h-4" />
          <span>{sessionData.correctAnswers} נכונות מתוך {sessionData.currentQuestion + (showResult ? 1 : 0)}</span>
        </div>
        
        <div className="flex gap-3">
          {!showResult && selectedAnswer && (
            <Button onClick={handleSubmitAnswer} disabled={isLoading}>
              שלח תשובה
            </Button>
          )}
          
          {showResult && (
            <Button onClick={handleNextQuestion}>
              {sessionData.currentQuestion < sessionData.questions.length - 1 ? 'השאלה הבאה' : 'סיום החידון'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizGame;