import React, { useState, useEffect } from 'react';
import { ChevronDown, BookOpen, Zap, Shield, Headphones, Users, GraduationCap, Building, Sparkles, TrendingUp, Brain, Target, Award, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/ui/Logo';

const AnimatedCounter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime = null;
    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  
  return <span>{count}</span>;
};

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => (
  <div 
    className="group relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors duration-300">{title}</h3>
      <p className="text-blue-900 font-semibold leading-relaxed drop-shadow group-hover:text-purple-800 transition-colors duration-300">{description}</p>
    </div>
  </div>
);

const StepCard = ({ number, title, description, delay = 0 }) => (
  <div 
    className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-400/50 transition-all duration-500 hover:scale-105 group"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
      {number}
    </div>
    <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-400 transition-colors duration-300">{title}</h3>
    <p className="text-blue-900 font-semibold leading-relaxed drop-shadow group-hover:text-purple-800 transition-colors duration-300">{description}</p>
  </div>
);

const FloatingElement = ({ children, delay = 0 }) => (
  <div 
    className="animate-float"
    style={{ 
      animationDelay: `${delay}s`,
      animationDuration: '6s',
      animationIterationCount: 'infinite'
    }}
  >
    {children}
  </div>
);

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        @keyframes graph-grow {
          0% { height: 20%; opacity: 0.3; }
          50% { height: 60%; opacity: 0.7; }
          100% { height: 80%; opacity: 1; }
        }
        @keyframes book-fly {
          0% { transform: translateX(-100px) rotate(-15deg); opacity: 0; }
          50% { transform: translateX(0px) rotate(0deg); opacity: 1; }
          100% { transform: translateX(100px) rotate(15deg); opacity: 0; }
        }
        @keyframes brain-pulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.1); filter: brightness(1.2); }
        }
        @keyframes trophy-bounce {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(-5deg); }
          75% { transform: translateY(-5px) rotate(5deg); }
        }
        @keyframes progress-fill {
          0% { width: 0%; }
          100% { width: 85%; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-graph-grow {
          animation: graph-grow 3s ease-in-out infinite alternate;
        }
        .animate-book-fly {
          animation: book-fly 8s ease-in-out infinite;
        }
        .animate-brain-pulse {
          animation: brain-pulse 2s ease-in-out infinite;
        }
        .animate-trophy-bounce {
          animation: trophy-bounce 2s ease-in-out infinite;
        }
        .animate-progress-fill {
          animation: progress-fill 2s ease-out forwards;
        }
        .mouse-follower {
          position: fixed;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
          pointer-events: none;
          z-index: 1;
          transition: transform 0.1s ease-out;
        }
      `}</style>
      
      <div 
        className="mouse-follower"
        style={{
          transform: `translate(${mousePosition.x - 150}px, ${mousePosition.y - 150}px)`
        }}
      />
      
      <div className="bg-gradient-to-br from-slate-100 via-blue-100 to-purple-100 min-h-screen flex flex-col text-gray-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          
          {/* Learning-related animated elements */}
          <div className="absolute top-32 left-20">
            <Brain className="w-12 h-12 text-purple-400/60 animate-brain-pulse" />
          </div>
          <div className="absolute top-96 right-32">
            <Award className="w-10 h-10 text-yellow-500/70 animate-trophy-bounce" />
          </div>
          <div className="absolute bottom-40 right-16">
            <Target className="w-8 h-8 text-green-500/60 animate-float" />
          </div>
          <div className="absolute top-64 left-1/3">
            <Lightbulb className="w-14 h-14 text-yellow-400/50 animate-pulse" />
          </div>
          
          {/* Flying books animation */}
          <div className="absolute top-48 left-0 w-full">
            <BookOpen className="w-8 h-8 text-blue-500/40 animate-book-fly" />
          </div>
          <div className="absolute top-80 left-0 w-full" style={{animationDelay: '2s'}}>
            <BookOpen className="w-6 h-6 text-purple-500/30 animate-book-fly" />
          </div>
          
          {/* Animated progress graph */}
          <div className="absolute bottom-32 left-16 flex items-end space-x-1">
            <div className="w-3 bg-blue-400/50 animate-graph-grow rounded-t" style={{animationDelay: '0s'}}></div>
            <div className="w-3 bg-purple-400/50 animate-graph-grow rounded-t" style={{animationDelay: '0.5s'}}></div>
            <div className="w-3 bg-cyan-400/50 animate-graph-grow rounded-t" style={{animationDelay: '1s'}}></div>
            <div className="w-3 bg-green-400/50 animate-graph-grow rounded-t" style={{animationDelay: '1.5s'}}></div>
          </div>
        </div>

        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl border-b border-blue-200/30">
                          <div className={`flex items-center space-x-3 transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}> 
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">TachlesAI</span>
          </div>
                      <div className={`flex items-center space-x-4 transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}> 
            <button
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
              onClick={() => navigate('/signup')}
            >
              הרשמה
            </button>
            <button
              className="px-6 py-2 border border-white/30 rounded-full hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              onClick={() => navigate('/auth')}
            >
              התחברות
            </button>
          </div>
        </header>

        <main className="flex-grow relative z-10">
          {/* Hero Section */}
          <section className="text-center py-32 px-4 relative">
            <div className="max-w-4xl mx-auto">
              <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}> 
                <FloatingElement>
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse-glow">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                </FloatingElement>
                
                <h1 className="text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-700 via-purple-700 to-cyan-600 bg-clip-text text-transparent animate-gradient drop-shadow-lg">
                  TachlesAI
                </h1>
                
                <p className="text-2xl font-semibold text-blue-900 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow">
                  הבינה המלאכותית שלך לניהול ידע - <span className="font-extrabold text-purple-800">למד בצורה חכמה יותר</span> עם פודקאסטים, חידונים ושיחות אינטראקטיביות
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    className="px-8 py-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full text-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-400/25 animate-pulse-glow"
                    onClick={() => navigate('/signup')}
                  >
                    התחל עכשיו - בחינם
                  </button>
                  <button className="px-8 py-4 border border-white/30 rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
                    <span>גלה עוד</span>
                    <ChevronDown className="w-5 h-5 animate-bounce" />
                  </button>
                </div>
              </div>
              
              {/* Stats */}
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}> 
                <div className="text-center">
                  <div className="mb-2">
                    <TrendingUp className="w-8 h-8 text-blue-500 mx-auto animate-bounce" />
                  </div>
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    <AnimatedCounter end={1000} />+
                  </div>
                  <div className="text-gray-400">סטודנטים מרוצים</div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2 mx-4">
                    <div className="bg-blue-500 h-2 rounded-full animate-progress-fill"></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="mb-2">
                    <BookOpen className="w-8 h-8 text-purple-500 mx-auto animate-pulse" />
                  </div>
                  <div className="text-4xl font-bold text-purple-400 mb-2">
                    <AnimatedCounter end={50} />+
                  </div>
                  <div className="text-gray-400">פורמטי תוכן</div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2 mx-4">
                    <div className="bg-purple-500 h-2 rounded-full animate-progress-fill" style={{animationDelay: '0.5s'}}></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="mb-2">
                    <Award className="w-8 h-8 text-cyan-500 mx-auto animate-trophy-bounce" />
                  </div>
                  <div className="text-4xl font-bold text-cyan-400 mb-2">
                    <AnimatedCounter end={95} />%
                  </div>
                  <div className="text-gray-400">שיפור ביעילות</div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2 mx-4">
                    <div className="bg-cyan-500 h-2 rounded-full animate-progress-fill" style={{animationDelay: '1s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 px-4 relative">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent drop-shadow-lg">
                  למה לבחור ב-TachlesAI?
                </h2>
                <p className="text-xl font-semibold text-blue-900 max-w-3xl mx-auto drop-shadow">
                  <span className="font-extrabold text-purple-800">פלטפורמה מהפכנית</span> שמשנה את הדרך שבה אתה לומד ומתקשר עם תוכן
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard 
                  icon={BookOpen}
                  title="למידה חכמה ומותאמת אישית"
                  description="התאמה אוטומטית של השיטה והפורמט לפי הסגנון והקצב שלך"
                  delay={0}
                />
                <FeatureCard 
                  icon={Zap}
                  title="חיסכון גדול בזמן"
                  description="גישה מיידית לעיקר התוכן בלי בזבוז קריאה מיותרת"
                  delay={200}
                />
                <FeatureCard 
                  icon={Headphones}
                  title="יצירת פודקאסטים"
                  description="הפוך כל הרצאה או מצגת לפרק פודקאסט איכותי"
                  delay={400}
                />
                <FeatureCard 
                  icon={Shield}
                  title="אבטחה ופרטיות מקסימליים"
                  description="כל הקבצים מוצפנים ואינם משותפים ללא אישורך"
                  delay={600}
                />
                <FeatureCard 
                  icon={GraduationCap}
                  title="חידונים אינטראקטיביים"
                  description="בחינות סימולציה עם הסברים מפורטים ומשוב מיידי"
                  delay={800}
                />
                <FeatureCard 
                  icon={Users}
                  title="מורה וירטואלי"
                  description="שוחח, שאל שאלות וקבל הסברים מתוך החומר שלך"
                  delay={1000}
                />
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="py-20 px-4 bg-black/20 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-purple-700 to-cyan-600 bg-clip-text text-transparent drop-shadow-lg">
                  איך זה עובד?
                </h2>
                <p className="text-xl font-semibold text-blue-900 drop-shadow">
                  <span className="font-extrabold text-purple-800">חמישה שלבים פשוטים</span> למהפכה בלמידה שלך
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <StepCard 
                  number="1"
                  title="העלה את התוכן שלך"
                  description="PDF, מצגות, סרטוני YouTube, הקלטות הרצאות ועוד"
                  delay={0}
                />
                <StepCard 
                  number="2"
                  title="הפק תמציות ונקודות מפתח"
                  description="סיכומים מיידיים של הפרקים והמבנה המרכזי"
                  delay={200}
                />
                <StepCard 
                  number="3"
                  title="בדוק את עצמך בחידונים"
                  description="שאלות רב-ברירתיות ובחינות סימולציה"
                  delay={400}
                />
                <StepCard 
                  number="4"
                  title="שוחח עם המורה הווירטואלי"
                  description="שאל שאלות וקבל הבהרות ישירות מתוך החומר"
                  delay={600}
                />
                <StepCard 
                  number="5"
                  title="צור פודקאסט מהחומר"
                  description="פרקי פודקאסט איכותיים להאזנה בכל מקום"
                  delay={800}
                />
              </div>
            </div>
          </section>

          {/* Target Audience */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent drop-shadow-lg">
                  למי זה מתאים?
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">סטודנטים</h3>
                  <p className="text-gray-300">בכל תחום - מאקדמיה ועד הכשרות מקצועיות</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">לומדים עצמאיים</h3>
                  <p className="text-gray-300">שרוצים לשלוט בקצב ובפורמט הלמידה</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">מורים ומרצים</h3>
                  <p className="text-gray-300">המעוניינים להעשיר את הקורסים בכלי AI</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Building className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">חברות</h3>
                  <p className="text-gray-300">הדרכות פנים-ארגוניות ואוריינות דיגיטלית</p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="py-20 px-4 bg-gradient-to-r from-purple-100 to-blue-100">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-extrabold mb-10 bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent drop-shadow-lg">
                מסלולי תמחור
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Free Plan */}
                <div className="rounded-3xl border-2 border-blue-400 bg-white/80 shadow-xl p-8 flex flex-col items-center hover:scale-105 transition-transform duration-300">
                  <h3 className="text-2xl font-bold text-blue-700 mb-4">מנוי חינמי</h3>
                  <ul className="text-right text-lg font-semibold text-blue-900 space-y-2 mb-6">
                    <li><span className="font-extrabold text-purple-800">3</span> העלאות, הדבקות והקלטות ליום</li>
                    <li><span className="font-extrabold text-purple-800">5</span> שיחות AI ליום (<span className="font-extrabold text-purple-800">10</span> בחודש במצב Learn+)</li>
                    <li><span className="font-extrabold text-purple-800">10</span> תשובות חידון ליום</li>
                    <li><span className="font-extrabold text-purple-800">2</span> מבחני תרגול בחודש</li>
                  </ul>
                  <div className="text-3xl font-extrabold text-blue-700 mb-2">חינם</div>
                  <div className="text-sm text-blue-500">ללא צורך בכרטיס אשראי</div>
                  <button
                    className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-400 to-purple-400 text-white font-bold rounded-full shadow-lg hover:from-blue-500 hover:to-purple-500 transition-all text-lg"
                    onClick={() => navigate('/signup')}
                  >
                    הירשם עכשיו
                  </button>
                </div>
                {/* Pro Plan */}
                <div className="rounded-3xl border-2 border-purple-500 bg-white/80 shadow-xl p-8 flex flex-col items-center hover:scale-105 transition-transform duration-300">
                  <h3 className="text-2xl font-bold text-purple-700 mb-4">מנוי פרו</h3>
                  <ul className="text-right text-lg font-semibold text-purple-900 space-y-2 mb-6">
                    <li>הכל <span className="font-extrabold text-purple-800">ללא הגבלה</span></li>
                  </ul>
                  <div className="text-3xl font-extrabold text-purple-700 mb-2">בקרוב</div>
                  <div className="text-sm text-purple-500">הצטרפו לרשימת ההמתנה</div>
                  <button
                    className="mt-4 px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-full shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all text-lg"
                  >
                    שדרג
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent drop-shadow-lg">
                התחל ללמוד אחרת כבר היום
              </h2>
              <p className="text-xl font-semibold text-blue-900 mb-8 max-w-2xl mx-auto drop-shadow">
                <span className="font-extrabold text-purple-800">הצטרף לאלפי סטודנטים</span> שכבר מהפכים את הדרך שבה הם לומדים
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center gap-3 text-lg">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span>הירשם בחינם</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-lg">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span>העלה חומר ראשון</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-lg">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span>התחל ללמוד בצורה חכמה יותר</span>
                </div>
              </div>
              
              <button
                className="px-12 py-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full text-xl font-bold hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-400/25 animate-pulse-glow"
                onClick={() => navigate('/signup')}
              >
                התחל עכשיו - בחינם
              </button>
              
              <p className="text-sm text-gray-400 mt-4">
                ללא מחויבות • ביטול בכל עת • תמיכה 24/7
              </p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Landing;
