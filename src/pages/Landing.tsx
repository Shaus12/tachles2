import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { FileText, Globe, Video } from 'lucide-react';

const Landing = () => {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
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
        <section className="text-center py-20 px-4">
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
        </section>

        <section className="bg-gray-50 py-16 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">קבצי PDF</h3>
              <p className="text-gray-600">העלה מאמרים ודוחות כבסיס לידע</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">קישורים</h3>
              <p className="text-gray-600">הוסף דפי אינטרנט ומאמרים מקוונים</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">מולטימדיה</h3>
              <p className="text-gray-600">שלב תוכן וידאו ואודיו למחקר</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
