import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';

const Landing = () => {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 shadow-sm bg-white/80 backdrop-blur-md">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Logo />
          <span className="text-xl font-medium text-gray-900">TachlesAI</span>
        </div>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Link to="/signup">
            <Button className="bg-blue-600 hover:bg-blue-700">הרשמה</Button>
          </Link>
          <Link to="/auth">
            <Button variant="outline">התחברות</Button>
          </Link>
        </div>
      </header>

      <main className="flex-grow">
        <section className="text-center py-24 px-4 bg-gradient-to-b from-blue-50 via-white to-white">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <Logo size="lg" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">TachlesAI</h1>
            <p className="text-xl text-gray-600 mb-8">הבינה המלאכותית שלך לניהול ידע</p>
            <div className="flex justify-center space-x-4 rtl:space-x-reverse">
              <Link to="/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">התחל עכשיו</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-3xl font-semibold mb-6 text-center">סיכום מהיר</h2>
          <p className="text-gray-700 text-lg leading-relaxed text-center">
            <strong>TachlesAI</strong> הוא מורה אישי מבוסס בינה מלאכותית שמפשט את הלמידה שלך ונותן לך לגשת לחומר בכל פורמט: תמציות חכמות, שיחות אינטראקטיביות, חידונים — ועכשיו גם יצירת פודקאסטים אוטומטיים מתוך החומר הלימודי שלך, כדי שתוכל ללמוד גם בהאזנה בדרכים.
          </p>
        </section>

        <section className="bg-gray-50 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold mb-6 text-center">למה לבחור ב-TachlesAI?</h2>
            <ul className="list-disc list-inside space-y-2 max-w-3xl mx-auto text-lg text-gray-700">
              <li><strong>למידה חכמה ומותאמת אישית</strong> התאמה אוטומטית של השיטה והפורמט לפי הסגנון והקצב שלך.</li>
              <li><strong>חיסכון גדול בזמן</strong> גישה מיידית לעיקר התוכן בלי בזבוז קריאה מיותרת.</li>
              <li><strong>תוכן רב-גילי ומתחדש</strong> תמציות, כרטיסיות וחידונים שמעניקים לך את כל העיקר בלי להתעמק בפרטים שוליים.</li>
              <li><strong>יצירת פודקאסטים</strong> הפוך כל הרצאה, סיכום או מצגת לפרק פודקאסט איכותי — פשוט האזן בכל מקום ובכל זמן.</li>
              <li><strong>אבטחה ופרטיות מקסימליים</strong> כל הקבצים מוצפנים ואינם משותפים ללא אישורך.</li>
            </ul>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-3xl font-semibold mb-6 text-center">איך זה עובד?</h2>
          <ol className="list-decimal list-inside space-y-2 text-lg text-gray-700">
            <li><strong>העלה את התוכן שלך</strong> – PDF, מצגות, סרטוני YouTube, הקלטות הרצאות ועוד.</li>
            <li><strong>הפק תמציות ונקודות מפתח</strong> – סיכומים מיידיים של הפרקים והמבנה המרכזי.</li>
            <li><strong>בדוק את עצמך בחידונים</strong> – שאלות רב-ברירתיות ובחינות סימולציה עם הסברים מפורטים.</li>
            <li><strong>שוחח עם המורה הווירטואלי</strong> – שאל שאלות, קבל הבהרות וציטוטים ישירות מתוך החומר.</li>
            <li><strong>צור פודקאסט מהחומר</strong> – בחר קטעים עיקריים, הגדר סגנון דיבור, ו-TachlesAI יפיק עבורך פרק פודקאסט איכותי להאזנה – בנסיעה, באימון או בבית.</li>
          </ol>
        </section>

        <section className="bg-gray-50 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold mb-6 text-center">למי זה מתאים?</h2>
            <ul className="list-disc list-inside space-y-2 max-w-3xl mx-auto text-lg text-gray-700">
              <li><strong>סטודנטים</strong> בכל תחום — מאקונומיקה ועד רפואה</li>
              <li><strong>לומדים עצמאיים</strong> שרוצים לשלוט בקצב ובפורמט</li>
              <li><strong>מורים ומרצים</strong> המעוניינים להעשיר את הקורסים שלהם בכלי AI</li>
              <li><strong>אוריינות ארגונית</strong> בחברות טכנולוגיה והדרכות פנים-ארגוניות</li>
            </ul>
          </div>
        </section>

        <section className="bg-blue-50 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-6">התחל ללמוד אחרת כבר היום</h2>
            <ol className="list-decimal list-inside space-y-2 text-lg text-gray-700">
              <li>הירשם בחינם ב־<a href="https://tachlesai.com" className="text-blue-600 underline">tachlesai.com</a></li>
              <li>העלה חומר ראשון והנח ל-TachlesAI לקחת אותך לשלב הבא בלמידה</li>
              <li>הפוך כל תוכן לפודקאסט, חידון או שיחה אינטראקטיבית — ותגלה כמה יעילה וקלה יכולה להיות הלמידה שלך!</li>
            </ol>
            <div className="mt-6">
              <Link to="/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">התחל עכשיו</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
