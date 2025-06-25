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
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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

    // Validate password length
    if (password.length < 6) {
      toast({
        title: "שגיאה",
        description: "הסיסמה חייבת להכיל לפחות 6 תווים",
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
          }
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
      
      if (data.user && !data.session) {
        // Email confirmation required
        toast({
          title: "נרשמת בהצלחה!",
          description: "אנא בדוק את האימייל שלך ולחץ על קישור האישור כדי להשלים את ההרשמה.",
        });
      } else {
        // Auto sign in successful
        toast({
          title: "ברוך הבא!",
          description: "נרשמת ונכנסת בהצלחה למערכת.",
        });
      }
      
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
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

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