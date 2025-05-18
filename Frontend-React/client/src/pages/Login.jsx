import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, LogIn, User } from 'lucide-react';
import { api } from '@/services/api';

export default function Login() {
  const [location, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.email || !formData.password) {
      toast({
        title: 'Login Error',
        description: 'Please enter your email and password.',
        variant: 'destructive',
      });
      return;
    }
    
    // Show loading state
    setLoading(true);
    
    try {
      // Use the API service for login
      const response = await api.auth.login({
        email: formData.email,
        password: formData.password
      });
      
      // Check for token in response
      if (response.data && response.data.token) {
        // Store the token
        localStorage.setItem('hotelAuth', JSON.stringify({
          isAuthenticated: true,
          token: response.data.token
        }));
        
        // Notify success
        toast({
          title: 'Login Successful',
          description: 'Welcome to the Hotel Management System.',
        });
        
        // Redirect to dashboard
        setLocation('/');
      } else {
        // Handle error response from API
        toast({
          title: 'Login Failed',
          description: response.data?.message || 'Invalid email or password. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      
      toast({
        title: 'Login Failed',
        description: error.response?.data?.message || 'An error occurred connecting to the server. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 px-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
            <Lock className="h-8 w-8 text-white" strokeWidth={1.5} />
          </div>
          <CardTitle className="text-2xl font-bold">Hotel Management System</CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  autoComplete="email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  autoComplete="current-password"
                />
                <div 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                  onClick={toggleShowPassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rememberMe" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: checked }))}
                />
                <label 
                  htmlFor="rememberMe" 
                  className="text-sm text-gray-500 cursor-pointer select-none"
                >
                  Remember me
                </label>
              </div>
              
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-4"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6 text-sm text-gray-600">
          <p>
            Don't have an account?{' '}
            <a href="#" className="font-medium text-primary hover:underline">
              Contact your administrator
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}