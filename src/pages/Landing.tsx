import React, { useState, useEffect } from 'react';
import { ChevronDown, BookOpen, Zap, Shield, Headphones, Users, GraduationCap, Building, Sparkles } from 'lucide-react';

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
      <p className="text-gray-300 leading-relaxed">{description}</p>
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
    <p className="text-gray-300 leading-relaxed">{description}</p>
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
      
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-screen flex flex-col text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-black/20 backdrop-blur-xl border-b border-white/10">
          <div className={`flex items-center space-x-3 rtl:space-x-reverse transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}> 
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">TachlesAI</span>
          </div>
          <div className={`flex items-center space-x-4 rtl:space-x-reverse transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}> 
            <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
              הרשמה
            </button>
            <button className="px-6 py-2 border border-white/30 rounded-full hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
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
                
                <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                  TachlesAI
                </h1>
                
                <p className="text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                  הבינה המלאכותית שלך לניהול ידע - למד בצורה חכמה יותר עם פודקאסטים, חידונים ושיחות אינטראקטיביות
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 animate-pulse-glow">
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
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    <AnimatedCounter end={1000} />+
                  </div>
                  <div className="text-gray-400">סטודנטים מרוצים</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">
                    <AnimatedCounter end={50} />+
                  </div>
                  <div className="text-gray-400">פורמטי תוכן</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-cyan-400 mb-2">
                    <AnimatedCounter end={95} />%
                  </div>
                  <div className="text-gray-400">שיפור ביעילות</div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 px-4 relative">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  למה לבחור ב-TachlesAI?
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  פלטפורמה מהפכנית שמשנה את הדרך שבה אתה לומד ומתקשר עם תוכן
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
                <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  איך זה עובד?
                </h2>
                <p className="text-xl text-gray-300">
                  חמישה שלבים פשוטים למהפכה בלמידה שלך
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
                <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
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

          {/* CTA Section */}
          <section className="py-20 px-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                התחל ללמוד אחרת כבר היום
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                הצטרף לאלפי סטודנטים שכבר מהפכים את הדרך שבה הם לומדים
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
              
              <button className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 animate-pulse-glow">
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
