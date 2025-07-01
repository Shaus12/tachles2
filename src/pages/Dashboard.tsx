import React from 'react';
import { motion } from 'framer-motion';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import NotebookGrid from '@/components/dashboard/NotebookGrid';
import EmptyDashboard from '@/components/dashboard/EmptyDashboard';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useAuth } from '@/contexts/AuthContext';
import PageTransition from '@/components/ui/PageTransition';
import FadeIn from '@/components/ui/FadeIn';

const Dashboard = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const { notebooks, isLoading, error, isError } = useNotebooks();
  const hasNotebooks = notebooks && notebooks.length > 0;

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <PageTransition className="min-h-screen bg-gray-50">
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <FadeIn direction="down" className="mb-8">
            <h1 className="text-4xl font-medium text-gray-900 mb-2">ברוכים הבאים ל-TachlesAI</h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.3} className="text-center py-16">
            <motion.div 
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-600">מאתחל...</p>
          </FadeIn>
        </main>
      </PageTransition>
    );
  }

  // Show auth error if present
  if (authError) {
    return (
      <PageTransition className="min-h-screen bg-gray-50">
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <FadeIn direction="down" className="mb-8">
            <h1 className="text-4xl font-medium text-gray-900 mb-2">ברוכים הבאים ל-TachlesAI</h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.3} className="text-center py-16">
            <motion.p 
              className="text-red-600"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              שגיאת אימות: {authError}
            </motion.p>
            <motion.button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              נסה שוב
            </motion.button>
          </FadeIn>
        </main>
      </PageTransition>
    );
  }

  // Show notebooks loading state
  if (isLoading) {
    return (
      <PageTransition className="min-h-screen bg-gray-50">
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <FadeIn direction="down" className="mb-8">
            <h1 className="text-4xl font-medium text-gray-900 mb-2">ברוכים הבאים ל-TachlesAI</h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.3} className="text-center py-16">
            <motion.div 
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-600">טוען את המחברות שלך...</p>
          </FadeIn>
        </main>
      </PageTransition>
    );
  }

  // Show notebooks error if present
  if (isError && error) {
    return (
      <PageTransition className="min-h-screen bg-gray-50">
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <FadeIn direction="down" className="mb-8">
            <h1 className="text-4xl font-medium text-gray-900 mb-2">ברוכים הבאים ל-TachlesAI</h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.3} className="text-center py-16">
            <motion.p 
              className="text-red-600"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              שגיאה בטעינת המחברות: {error}
            </motion.p>
            <motion.button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              נסה שוב
            </motion.button>
          </FadeIn>
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-white">
      <DashboardHeader userEmail={user?.email} />
      
      <main className="max-w-7xl mx-auto px-6 py-[60px]">
        <FadeIn direction="down" className="mb-8">
          <motion.h1 
            className="font-medium text-gray-900 mb-2 text-5xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            ברוכים הבאים ל-TachlesAI
          </motion.h1>
        </FadeIn>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {hasNotebooks ? <NotebookGrid /> : <EmptyDashboard />}
        </motion.div>
      </main>
    </PageTransition>
  );
};

export default Dashboard;