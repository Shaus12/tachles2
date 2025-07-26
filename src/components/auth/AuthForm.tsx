import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard');
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Google OAuth sign in
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    try {
      console.log('Attempting Google sign in...');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      
      if (error) {
        console.error('Google sign in error:', error);
        throw error;
      }
      
      // The OAuth flow will redirect, so we don't need to handle success here
      
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast({
        title: "שגיאת התחברות Google",
        description: error.message || "אירעה שגיאה בעת ההתחברות עם Google. אנא נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  // פונקציה לבדיקת חוזק סיסמה
  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    
    if (password.length < minLength) {
      errors.push(`לפחות ${minLength} תווים`);
    }
    if (!hasUpperCase) {
      errors.push('לפחות אות גדולה אחת (A-Z)');
    }
    if (!hasLowerCase) {
      errors.push('לפחות אות קטנה אחת (a-z)');
    }
    if (!hasNumbers) {
      errors.push('לפחות מספר אחד (0-9)');
    }
    if (!hasSpecialChar) {
      errors.push('לפחות תו מיוחד אחד (!@#$%^&*)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting sign in for:', email);
      
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('אימייל או סיסמה שגויים. אנא בדוק את הפרטים ונסה שוב.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('אנא בדוק את האימייל שלך ולחץ על קישור האישור לפני הכניסה.');
        } else {
          throw error;
        }
      }
      
      console.log('Sign in successful:', data.user?.email);
      
      toast({
        title: "ברוך הבא!",
        description: "נכנסת בהצלחה למערכת.",
      });

      // The AuthContext will handle the redirect automatically
      
    } catch (error: any) {
      console.error('Auth form error:', error);
      toast({
        title: "שגיאת כניסה",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      toast({
        title: "שגיאה",
        description: "הסיסמאות אינן תואמות",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // בדיקת חוזק סיסמה
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast({
        title: "סיסמה לא מאובטחת מספיק",
        description: `הסיסמה חייבת לכלול: ${passwordValidation.errors.join(', ')}`,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting sign up for:', email);
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        if (error.message.includes('User already registered')) {
          throw new Error('משתמש עם אימייל זה כבר קיים במערכת.');
        } else if (error.message.includes('Password should be at least 6 characters')) {
          throw new Error('הסיסמה חייבת להכיל לפחות 6 תווים.');
        } else {
          throw error;
        }
      }
      
      console.log('Sign up successful:', data.user?.email);
      
      // Always show email confirmation message for new signups
      setShowEmailConfirmation(true);
      
      toast({
        title: "נרשמת בהצלחה!",
        description: "נשלח אימייל אישור לכתובת שהזנת. אנא בדוק את תיבת הדואר שלך ולחץ על הקישור כדי להשלים את ההרשמה.",
      });
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "שגיאת הרשמה",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setShowEmailConfirmation(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  const handleBackToSignIn = () => {
    setShowEmailConfirmation(false);
    setIsSignUp(false);
    resetForm();
  };

  // Show email confirmation screen after successful signup
  if (showEmailConfirmation) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>בדוק את האימייל שלך</CardTitle>
          <CardDescription>
            נשלח אימייל אישור לכתובת {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">אימייל נשלח!</h3>
            <p className="text-gray-600 mb-4">
              אנא בדוק את תיבת הדואר שלך (כולל תיקיית הספאם) ולחץ על הקישור כדי לאמת את החשבון שלך.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              לאחר האימות תוכל להתחבר למערכת עם הפרטים שהזנת.
            </p>
          </div>
          
          <Button 
            onClick={handleBackToSignIn} 
            variant="outline" 
            className="w-full"
          >
            חזור לכניסה למערכת
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isSignUp ? 'הרשמה למערכת' : 'כניסה למערכת'}</CardTitle>
        <CardDescription>
          {isSignUp 
            ? 'צור חשבון חדש כדי להתחיל להשתמש ב-TachlesAI'
            : 'הזן את פרטי הכניסה שלך כדי לגשת למחברות'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="fullName">שם מלא</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="הזן את השם המלא שלך"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="הזן את האימייל שלך"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">סיסמה</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="הזן את הסיסמה שלך"
              minLength={6}
            />
          </div>
          
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">אישור סיסמה</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="הזן שוב את הסיסמה שלך"
                minLength={6}
              />
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading 
              ? (isSignUp ? 'נרשם...' : 'נכנס...') 
              : (isSignUp ? 'הרשמה' : 'כניסה')
            }
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <div className="mx-4 text-sm text-gray-500">או</div>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Sign In Button */}
        <Button 
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          variant="outline"
          className="w-full flex items-center justify-center gap-3 py-2.5"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          {googleLoading ? 'מתחבר...' : `${isSignUp ? 'הרשמה' : 'כניסה'} עם Google`}
        </Button>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {isSignUp ? 'כבר יש לך חשבון?' : 'אין לך חשבון?'}
            {' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              {isSignUp ? 'כניסה למערכת' : 'הרשמה'}
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthForm;