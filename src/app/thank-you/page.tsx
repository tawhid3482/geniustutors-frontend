'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Home, User, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext.next';

export default function ThankYouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for auth context to load
    if (loading) return;
    
    // Get user role from URL params or context
    const role = searchParams.get('role') || user?.role || '';
    const name = searchParams.get('name') || user?.name || user?.full_name || '';
    
    setUserRole(role);
    setUserName(name);
    setIsLoading(false);

    // If no user data is available and no URL params, redirect to home after 3 seconds
    if (!role && !user && !searchParams.get('role')) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, user, router, loading]);

  const getDashboardPath = () => {
    switch (userRole) {
      case 'student':
        return '/student';
      case 'tutor':
        return '/tutor';
      case 'admin':
        return '/admin';
      case 'super-admin':
        return '/super-admin';
      case 'manager':
        return '/manager';
      default:
        return '/dashboard';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'student':
        return <GraduationCap className="h-8 w-8 text-blue-600" />;
      case 'tutor':
        return <User className="h-8 w-8 text-green-600" />;
      default:
        return <User className="h-8 w-8 text-gray-600" />;
    }
  };

  const getRoleTitle = () => {
    switch (userRole) {
      case 'student':
        return 'Student';
      case 'tutor':
        return 'Tutor';
      case 'admin':
        return 'Admin';
      case 'super-admin':
        return 'Super Admin';
      case 'manager':
        return 'Manager';
      default:
        return 'User';
    }
  };

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full mx-auto text-center">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
            {/* Success Icon */}
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              
              {/* Role Icon */}
              <div className="flex justify-center mb-4">
                {getRoleIcon()}
              </div>
            </div>

            {/* Success Message */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Welcome to Genius Tutors!
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                Your {getRoleTitle().toLowerCase()} account has been created successfully.
              </p>
              {userName && (
                <p className="text-sm text-gray-500">
                  Hello, {userName}!
                </p>
              )}
            </div>

            {/* Thank You Message */}
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 text-center">
              <h2 className="text-xl font-semibold text-green-800 mb-3">
                Thank You for Joining Us!
              </h2>
              <p className="text-green-700 leading-relaxed">
                {userRole === 'student' 
                  ? "You can now browse tuition jobs, connect with tutors, and find the perfect learning match for your educational needs."
                  : userRole === 'tutor'
                  ? "You can now create your profile, browse available tuition jobs, and start connecting with students who need your expertise."
                  : "Your account is ready! You can now access all the features available to your role."
                }
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <Button
                  onClick={() => router.push(getDashboardPath())}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 font-medium py-2 px-6 rounded-xl transition-all duration-300"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
                
                {userRole === 'student' && (
                  <Button
                    variant="outline"
                    onClick={() => router.push('/tuition-jobs')}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-medium py-2 px-6 rounded-xl transition-all duration-300"
                  >
                    Browse Jobs
                  </Button>
                )}
                
                {userRole === 'tutor' && (
                  <Button
                    variant="outline"
                    onClick={() => router.push('/tutor-hub')}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-medium py-2 px-6 rounded-xl transition-all duration-300"
                  >
                    Explore Hub
                  </Button>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Need help? Contact our support team or check out our FAQ section.
              </p>
              <div className="flex justify-center space-x-4 mt-3">
                <Link 
                  href="/contact" 
                  className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  Contact Support
                </Link>
                <span className="text-gray-300">•</span>
                <Link 
                  href="/faq" 
                  className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  FAQ
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
