import { useState } from 'react';
import { triggerHapticFeedback, triggerSuccessHaptic } from '@/utils/haptic-feedback';
import { useNavigate, Link } from 'react-router-dom';
import { trackEvent } from '@/lib/analytics';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { sendPasswordResetEmail } from 'firebase/auth'; // Add Firebase import
import { auth } from '@/firebase'; // Adjust path to your Firebase config

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false); // Toggle for password reset mode
  const [resetEmail, setResetEmail] = useState(''); // Email for password reset
  const [resetMessage, setResetMessage] = useState<string | null>(null); // Success/error message for reset
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Map Firebase error codes to user-friendly messages
  const getFriendlyError = (error: unknown) => {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      typeof (error as { code: unknown }).code === 'string'
    ) {
      switch ((error as { code: string }).code) {
        case 'auth/invalid-email':
          return 'Invalid email address.';
        case 'auth/user-disabled':
          return 'This user account has been disabled.';
        case 'auth/user-not-found':
          return 'No user found with this email.';
        case 'auth/wrong-password':
          return 'Incorrect password.';
        case 'auth/too-many-requests':
          return 'Too many failed attempts. Please try again later.';
        default:
          return (error as { message?: string }).message || 'An error occurred. Please try again.';
      }
    }
    return 'An error occurred. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHapticFeedback(20);
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signIn(email, password);
      triggerSuccessHaptic();
      await trackEvent({
        name: 'user_login',
        params: {
          method: 'email',
          email,
        },
      });
      navigate('/');
    } catch (error: unknown) {
      setErrorMessage(getFriendlyError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    triggerHapticFeedback(20);
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
      await trackEvent({
        name: 'user_login',
        params: {
          method: 'google',
        },
      });
      navigate('/');
    } catch (error: unknown) {
      setErrorMessage(getFriendlyError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHapticFeedback(20);
    setIsLoading(true);
    setErrorMessage(null);
    setResetMessage(null);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      triggerSuccessHaptic();
      await trackEvent({
        name: 'password_reset_request',
        params: {
          email: resetEmail,
        },
      });
      setResetMessage('Password reset email sent! Check your inbox.');
      setResetEmail('');
      setIsResetMode(false); // Switch back to login mode
    } catch (error: unknown) {
      setErrorMessage(getFriendlyError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {isResetMode ? 'Reset Password' : 'Welcome back'}
          </CardTitle>
          <CardDescription>
            {isResetMode ? 'Enter your email to receive a password reset link' : 'Sign in to your account to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isResetMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <div className="text-sm text-right">
                  <button
                    type="button"
                    className="text-white hover:underline"
                    onClick={() => {
                      setIsResetMode(true);
                      setResetEmail(email); // Pre-fill reset email with login email
                      setErrorMessage(null);
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
              {errorMessage && (
                <div className="mt-2 text-sm text-white/70 text-center" role="alert">
                  {errorMessage}
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              {errorMessage && (
                <div className="mt-2 text-sm text-white/70 text-center" role="alert">
                  {errorMessage}
                </div>
              )}
              {resetMessage && (
                <div className="mt-2 text-sm text-green-500 text-center" role="alert">
                  {resetMessage}
                </div>
              )}
              <div className="text-sm text-center">
                <button
                  type="button"
                  className="text-white hover:underline"
                  onClick={() => {
                    setIsResetMode(false);
                    setErrorMessage(null);
                    setResetMessage(null);
                  }}
                >
                  Back to Sign in
                </button>
              </div>
            </form>
          )}

          {!isResetMode && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                Google
              </Button>
            </>
          )}
        </CardContent>
        {!isResetMode && (
          <CardFooter className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-white hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
