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
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>כניסה למערכת</CardTitle>
        <CardDescription>
          הזן את פרטי הכניסה שלך כדי לגשת למחברות
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'נכנס...' : 'כניסה'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AuthForm;