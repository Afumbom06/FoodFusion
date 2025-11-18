import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { UtensilsCrossed, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Facebook } from 'lucide-react';

interface LoginFormProps {
  onBackToHome?: () => void;
  onForgotPassword?: () => void;
  onSignup?: () => void;
}

export function LoginForm({ onBackToHome, onForgotPassword, onSignup }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Client-side validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password, rememberMe);
      
      if (!result.success) {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'admin' | 'manager' | 'staff' | 'multi' | '2fa') => {
    const credentials = {
      admin: { email: 'admin@restaurant.com', password: 'admin123' },
      manager: { email: 'manager@restaurant.com', password: 'manager123' },
      staff: { email: 'staff@restaurant.com', password: 'staff123' },
      multi: { email: 'multi@restaurant.com', password: 'multi123' },
      '2fa': { email: '2fa@restaurant.com', password: 'secure123' },
    };
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
    setError('');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image with Welcome Message */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-900 to-blue-950">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1722125680299-783f98369451?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMGJ1cmdlcnxlbnwxfHx8fDE3NjI5NjIyNTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Restaurant Food"
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-5xl mb-6">Welcome Back!</h1>
          <p className="text-xl leading-relaxed max-w-md">
            Indulge your taste buds at our Restaurant Management System, where
            every operation tells a success story. Welcome to a
            management journey like no other!
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center">
                <UtensilsCrossed className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl mb-2">Restaurant Manager</h2>
            <h3 className="text-red-600 text-2xl mb-6">Sign In</h3>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-100 border-0 h-12"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-100 border-0 h-12 pr-10"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={loading}
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              {onForgotPassword && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={onForgotPassword}
                  className="text-blue-900 p-0 h-auto"
                  disabled={loading}
                >
                  Forgot Password?
                </Button>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 h-12 text-white" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            {onSignup && (
              <div className="text-center text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSignup}
                  className="text-red-600 hover:underline"
                  disabled={loading}
                >
                  Sign up
                </button>
              </div>
            )}

            {/* Social Login */}
            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-colors"
                onClick={() => setError('Social login is not available in demo mode')}
                disabled={loading}
              >
                <Facebook className="w-5 h-5" fill="currentColor" />
              </button>
              <button
                type="button"
                className="w-12 h-12 rounded-full bg-white border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors"
                onClick={() => setError('Social login is not available in demo mode')}
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
            </div>

            {/* Demo Access */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 space-y-2 mt-6">
              <p className="text-xs text-blue-900">Quick Demo Access:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('admin')}
                  disabled={loading}
                  className="text-xs"
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('manager')}
                  disabled={loading}
                  className="text-xs"
                >
                  Manager
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('staff')}
                  disabled={loading}
                  className="text-xs"
                >
                  Staff
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('multi')}
                  disabled={loading}
                  className="text-xs"
                >
                  Multi-Branch
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('2fa')}
                disabled={loading}
                className="text-xs w-full"
              >
                2FA Demo (code: 123456)
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
