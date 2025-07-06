import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { BookOpen, MessageSquare, FileText, Award, TrendingUp, Target, Brain, Clock } from 'lucide-react';

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

interface ProgressChartProps {
  data: ProgressData;
}

const ProgressChart = ({ data }: ProgressChartProps) => {
  const studyProgress = data.totalSources > 0 ? (data.studiedSources / data.totalSources) * 100 : 0;
  const engagementScore = Math.min(((data.chatMessages + data.totalNotes + data.quizzesTaken) / 10) * 100, 100);
  const studyHours = Math.floor(data.studyTimeMinutes / 60);
  const studyMinutes = data.studyTimeMinutes % 60;

  // אבני דרך
  const milestones = [
    { title: 'צעדים ראשונים', description: 'העלה מקור ראשון', achieved: data.totalSources > 0, icon: '🚀' },
    { title: 'תלמיד סקרן', description: 'שאל 5 שאלות', achieved: data.chatMessages >= 5, icon: '🤔' },
    { title: 'כותב הערות', description: 'כתב 3 הערות', achieved: data.totalNotes >= 3, icon: '📝' },
    { title: 'חובב חידונים', description: 'השלים חידון', achieved: data.quizzesTaken >= 1, icon: '🎯' },
    { title: 'גאון קטן', description: 'השיג 80% בחידון', achieved: data.quizSuccessRate >= 80, icon: '🧠' },
    { title: 'למדן מתמיד', description: 'למד שעה שלמה', achieved: studyHours >= 1, icon: '📚' },
    { title: 'מומחה', description: 'סיים 50% מהחומר', achieved: studyProgress >= 50, icon: '⭐' },
    { title: 'מאסטר', description: 'סיים כל החומר', achieved: studyProgress >= 100, icon: '🏆' },
  ];

  const achievedMilestones = milestones.filter(m => m.achieved);
  const nextMilestone = milestones.find(m => !m.achieved);

  const stats = [
    {
      icon: BookOpen,
      title: 'מקורות נלמדו',
      value: `${data.studiedSources}/${data.totalSources}`,
      progress: studyProgress,
      color: 'blue',
      description: 'מתוך החומר שהעלתה'
    },
    {
      icon: MessageSquare,
      title: 'שיחות עם AI',
      value: data.chatMessages.toString(),
      progress: Math.min((data.chatMessages / 50) * 100, 100),
      color: 'purple',
      description: 'שאלות ותשובות'
    },
    {
      icon: FileText,
      title: 'הערות שנכתבו',
      value: data.totalNotes.toString(),
      progress: Math.min((data.totalNotes / 20) * 100, 100),
      color: 'green',
      description: 'הערות ומחשבות'
    },
    {
      icon: Award,
      title: 'חידונים הושלמו',
      value: data.quizzesTaken.toString(),
      progress: Math.min((data.quizzesTaken / 10) * 100, 100),
      color: 'yellow',
      description: `${data.quizSuccessRate.toFixed(0)}% הצלחה`
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50',
      purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50',
      green: 'from-green-500 to-green-600 text-green-600 bg-green-50',
      yellow: 'from-yellow-500 to-yellow-600 text-yellow-600 bg-yellow-50'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* כותרת עם סיכום */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">מעקב התקדמות</h3>
                <p className="text-gray-600">המסע הלמידה שלך עד כה</p>
              </div>
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-blue-600">{Math.round(studyProgress)}%</div>
              <div className="text-sm text-gray-500">מהחומר נלמד</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">
                יעד: לימוד {data.totalSources} מקורות
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-600">
                ציון מעורבות: {Math.round(engagementScore)}%
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">
                זמן למידה: {studyHours > 0 ? `${studyHours}ש' ` : ''}{studyMinutes}ד'
              </span>
            </div>
            {data.totalQuizQuestions > 0 && (
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span className="text-sm text-gray-600">
                  {data.correctAnswers}/{data.totalQuizQuestions} שאלות נכונות
                </span>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* אבני דרך */}
      {achievedMilestones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6"
        >
          <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🏅</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">אבני דרך</h4>
                  <p className="text-sm text-gray-600">ההישגים שלך עד כה</p>
                </div>
              </div>
              <div className="text-left">
                <span className="text-lg font-bold text-amber-600">
                  {achievedMilestones.length}/{milestones.length}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {achievedMilestones.map((milestone, index) => (
                <motion.div
                  key={milestone.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center space-x-2 bg-amber-100 px-3 py-1 rounded-full"
                  title={milestone.description}
                >
                  <span className="text-sm">{milestone.icon}</span>
                  <span className="text-xs font-medium text-amber-800">{milestone.title}</span>
                </motion.div>
              ))}
            </div>
            
            {nextMilestone && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>יעד הבא:</span>
                <span className="font-medium">{nextMilestone.title}</span>
                <span>({nextMilestone.description})</span>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* גרפי התקדמות מפורטים */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const colorClasses = getColorClasses(stat.color);
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses.split(' ').slice(-1)[0]}`}>
                      <stat.icon className={`w-5 h-5 ${colorClasses.split(' ').slice(-2, -1)[0]}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{stat.title}</h4>
                      <p className="text-sm text-gray-500">{stat.description}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">התקדמות</span>
                    <span className="font-medium">{Math.round(stat.progress)}%</span>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  >
                    <Progress 
                      value={stat.progress} 
                      className="h-2"
                    />
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* הודעת עידוד והמלצות */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* הודעת עידוד */}
          <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">💪</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {studyProgress === 0
                    ? "בואו נתחיל! יש חומר מעניין ללמוד"
                    : studyProgress < 25 
                    ? "התחלה טובה! המשך כך" 
                    : studyProgress < 50 
                    ? "יופי! אתה בדרך הנכונה" 
                    : studyProgress < 75 
                    ? "אחלה התקדמות! כמעט באמצע הדרך" 
                    : studyProgress < 100
                    ? "כמעט סיימת! עוד קצת ותגמור הכל"
                    : "מעולה! סיימת את כל החומר! 🎉"}
                </p>
                <p className="text-sm text-gray-600">
                  {studyProgress < 100 
                    ? `נותרו ${data.totalSources - data.studiedSources} מקורות ללמידה`
                    : "כל הכבוד על השלמת כל החומר!"}
                </p>
              </div>
            </div>
          </Card>

          {/* המלצות מותאמות אישית */}
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">💡</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">המלצה להיום</p>
                <p className="text-sm text-gray-600">
                  {data.chatMessages < 5 
                    ? "נסה לשאול עוד שאלות מהמורה הווירטואלי"
                    : data.totalNotes < 3
                    ? "כתוב עוד הערות כדי לזכור טוב יותר"
                    : data.quizzesTaken < 2
                    ? "בדוק את עצמך עם חידון חדש"
                    : data.quizSuccessRate < 70 && data.totalQuizQuestions > 0
                    ? "נסה לשפר את הציון בחידונים!"
                    : studyProgress < 50
                    ? "המשך ללמוד מקורות חדשים"
                    : "כל הכבוד! המשך כך 🌟"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressChart; 