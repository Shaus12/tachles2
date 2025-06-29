import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gamepad2, Trophy, Clock, Target, Play, Plus, AlertCircle } from 'lucide-react';
import { useQuizQuestions } from '@/hooks/useQuizQuestions';
import QuizGame from './QuizGame';
import { createSampleQuestions } from '@/utils/sampleQuizData';
import { supabase } from '@/integrations/supabase/client';

interface QuizDialogProps {
  isOpen: boolean;
  onClose: () => void;
  notebookId: string;
  notebookTitle: string;
}

const QuizDialog: React.FC<QuizDialogProps> = ({ isOpen, onClose, notebookId, notebookTitle }) => {
  const { questions, isLoading, hasQuestions, getRandomQuestions, createQuestion, fetchQuestions } = useQuizQuestions(notebookId);
  const [gameMode, setGameMode] = useState<'practice' | 'timed' | 'exam'>('practice');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [showGame, setShowGame] = useState(false);
  const [gameQuestions, setGameQuestions] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [gameResults, setGameResults] = useState<any>(null);
  const [isCreatingSamples, setIsCreatingSamples] = useState(false);

  // מניעת סגירה אם המשחק פעיל
  const handleClose = () => {
    if (!showGame && !showResults) {
      onClose();
    }
  };

  const handleStartGame = () => {
    const selectedQuestions = getRandomQuestions(questionCount, difficulty === 'all' ? undefined : difficulty);
    if (selectedQuestions.length === 0) {
      return;
    }
    
    setGameQuestions(selectedQuestions);
    setShowGame(true);
  };

  const handleGameComplete = (results: any) => {
    setGameResults(results);
    setShowGame(false);
    setShowResults(true);
  };

  const handleGameExit = () => {
    setShowGame(false);
    setGameQuestions([]);
  };

  const handlePlayAgain = () => {
    setShowResults(false);
    setGameResults(null);
  };

  const handleCreateSampleQuestions = async () => {
    setIsCreatingSamples(true);
    try {
      await createSampleQuestions(supabase, notebookId);
      // רענון שאלות החידון
      await fetchQuestions();
    } catch (error) {
      console.error('Error creating sample questions:', error);
      alert('שגיאה ביצירת שאלות דוגמה');
    } finally {
      setIsCreatingSamples(false);
    }
  };

  const getDifficultyStats = () => {
    const stats = {
      easy: questions.filter(q => q.difficulty === 'easy').length,
      medium: questions.filter(q => q.difficulty === 'medium').length,
      hard: questions.filter(q => q.difficulty === 'hard').length,
    };
    return stats;
  };

  const difficultyStats = getDifficultyStats();

  if (showGame) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl h-[90vh] overflow-auto p-0">
          <QuizGame
            questions={gameQuestions}
            notebookId={notebookId}
            onComplete={handleGameComplete}
            onExit={handleGameExit}
          />
        </DialogContent>
      </Dialog>
    );
  }

  if (showResults && gameResults) {
    const scorePercentage = Math.round((gameResults.score / gameResults.totalQuestions) * 100);
    const getScoreColor = () => {
      if (scorePercentage >= 80) return 'text-green-600';
      if (scorePercentage >= 60) return 'text-yellow-600';
      return 'text-red-600';
    };

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center">
              <Trophy className="w-6 h-6 text-yellow-500" />
              תוצאות החידון
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-6">
            <div className={`text-4xl font-bold mb-2 ${getScoreColor()}`}>
              {scorePercentage}%
            </div>
            <p className="text-lg mb-4">
              {gameResults.score} נכונות מתוך {gameResults.totalQuestions} שאלות
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>זמן כולל:</span>
                <span>{Math.floor(gameResults.timeSpent / 60)}:{(gameResults.timeSpent % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handlePlayAgain} className="flex-1">
                שחק שוב
              </Button>
              <Button variant="outline" onClick={handleClose} className="flex-1">
                סגור
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-blue-600" />
            חידון: {notebookTitle}
          </DialogTitle>
          <DialogDescription>
            בחן את הידע שלך עם שאלות מהמחברת
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !hasQuestions ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">אין שאלות זמינות</h3>
            <p className="text-gray-600 mb-4">
              אין שאלות חידון במחברת זו. תוכל ליצור שאלות דוגמה כדי להתחיל.
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={handleCreateSampleQuestions} 
                disabled={isCreatingSamples}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {isCreatingSamples ? 'יוצר שאלות...' : 'צור שאלות דוגמה'}
              </Button>
              <Button onClick={handleClose} variant="outline">
                סגור
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* סטטיסטיקות שאלות */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">סטטיסטיקות שאלות</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gray-100 text-gray-800">סה"כ</Badge>
                    <span>{questions.length}</span>
                  </div>
                  {difficultyStats.easy > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">קל</Badge>
                      <span>{difficultyStats.easy}</span>
                    </div>
                  )}
                  {difficultyStats.medium > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800">בינוני</Badge>
                      <span>{difficultyStats.medium}</span>
                    </div>
                  )}
                  {difficultyStats.hard > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800">קשה</Badge>
                      <span>{difficultyStats.hard}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* הגדרות משחק */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">רמת קושי</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הרמות</SelectItem>
                    {difficultyStats.easy > 0 && <SelectItem value="easy">קל</SelectItem>}
                    {difficultyStats.medium > 0 && <SelectItem value="medium">בינוני</SelectItem>}
                    {difficultyStats.hard > 0 && <SelectItem value="hard">קשה</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">מספר שאלות</label>
                <Select value={questionCount.toString()} onValueChange={(v) => setQuestionCount(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 שאלות</SelectItem>
                    <SelectItem value="10">10 שאלות</SelectItem>
                    <SelectItem value="15">15 שאלות</SelectItem>
                    <SelectItem value="20">20 שאלות</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">סוג משחק</label>
                <Select value={gameMode} onValueChange={(v: any) => setGameMode(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="practice">תרגול</SelectItem>
                    <SelectItem value="timed">זמן מוגבל</SelectItem>
                    <SelectItem value="exam">מבחן</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* כפתורי פעולה */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleStartGame} className="flex-1" disabled={!hasQuestions}>
                <Play className="w-4 h-4 mr-2" />
                התחל חידון
              </Button>
              <Button variant="outline" onClick={handleClose}>
                ביטול
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuizDialog; 