'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, CheckCircle, Crown, Briefcase, FileText, UserCheck, HeartHandshake, XCircle, MapPin, ArrowRight, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.next';
import { tutorDashboardService } from '@/services/tutorDashboardService';
import { noticeBoardService, Notice } from '@/services/noticeBoardService';

const DashboardSection = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    totalSessions: 0,
    completedSessions: 0,
    pendingSessions: 0,
    averageRating: '0.0',
    totalStudents: 0,
    activeJobs: 0,
    appliedJobs: 0,
    acceptedJobs: 0,
    shortlistedJobs: 0,
    appointedJobs: 0,
    confirmedJobs: 0,
    cancelledJobs: 0,
    nearbyJobs: 39,
    profileCompletion: 13,
    isVerified: false,
    isGeniusTutor: false
  });
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const stats = await tutorDashboardService.getDashboardStats();
        setDashboardStats(prev => ({ ...prev, ...stats }));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchNotices = async () => {
      try {
        setLoadingNotices(true);
        const response = await noticeBoardService.getTutorNotices();
        if (response.success) {
          setNotices(response.data);
        }
      } catch (error) {
        console.error('Error fetching notices:', error);
      } finally {
        setLoadingNotices(false);
      }
    };

    fetchDashboardData();
    fetchNotices();
  }, []);

  // Get notice type icon and styling
  const getNoticeTypeConfig = (type: string) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
          iconColor: 'text-green-600'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-500',
          iconColor: 'text-yellow-600'
        };
      case 'urgent':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          iconColor: 'text-red-600'
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500',
          iconColor: 'text-blue-600'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 border-t-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-4">
      {/* Notice Board */}
      <Card className="bg-white rounded-xl shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Megaphone className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">Notice Board</h2>
          </div>
          
          {loadingNotices ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600">Loading notices...</span>
            </div>
          ) : notices.length > 0 ? (
            <div className="space-y-3">
              {notices.map((notice) => {
                const typeConfig = getNoticeTypeConfig(notice.type);
                const TypeIcon = typeConfig.icon;
                
                return (
                  <div 
                    key={notice.id} 
                    className={`${typeConfig.bgColor} rounded-lg p-4 border-l-4 ${typeConfig.borderColor}`}
                  >
                    <div className="flex items-start gap-3">
                      <TypeIcon className={`h-5 w-5 ${typeConfig.iconColor} mt-0.5 flex-shrink-0`} />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 mb-1">{notice.title}</h3>
                        <p className="text-gray-700 leading-relaxed text-sm mb-2">
                          {notice.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(notice.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              notice.type === 'urgent' ? 'bg-red-100 text-red-700' :
                              notice.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                              notice.type === 'success' ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {notice.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No notices available</p>
              <p className="text-sm text-gray-500">Check back later for important updates and announcements.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification & Badge Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dashboardStats.isVerified ? 'bg-green-100' : 'bg-gray-100'}`}>
                <CheckCircle className={`h-6 w-6 ${dashboardStats.isVerified ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Verification Status</h3>
                <p className={`text-sm ${dashboardStats.isVerified ? 'text-green-600' : 'text-gray-500'}`}>
                  {dashboardStats.isVerified ? 'Verified Tutor' : 'Not Verified'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dashboardStats.isGeniusTutor ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                <Crown className={`h-6 w-6 ${dashboardStats.isGeniusTutor ? 'text-yellow-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Genius Tutor Badge</h3>
                <p className={`text-sm ${dashboardStats.isGeniusTutor ? 'text-yellow-600' : 'text-gray-500'}`}>
                  {dashboardStats.isGeniusTutor ? 'Genius Tutor' : 'Standard Tutor'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Briefcase className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 mb-1">{dashboardStats.appliedJobs}</div>
            <div className="text-sm text-gray-600">Applied Jobs</div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 mb-1">{dashboardStats.shortlistedJobs}</div>
            <div className="text-sm text-gray-600">Shortlisted Jobs</div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <UserCheck className="h-8 w-8 text-green-700 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 mb-1">{dashboardStats.appointedJobs}</div>
            <div className="text-sm text-gray-600">Appointed Jobs</div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <HeartHandshake className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 mb-1">{dashboardStats.confirmedJobs}</div>
            <div className="text-sm text-gray-600">Confirmed Jobs</div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 mb-1">{dashboardStats.cancelledJobs}</div>
            <div className="text-sm text-gray-600">Cancelled Jobs</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nearby Jobs */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nearby Jobs</h3>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">{dashboardStats.nearbyJobs}</div>
              <div className="text-sm text-gray-600 mb-4">in your nearest area.</div>
              <div className="flex items-center justify-center text-green-600 hover:text-green-700 cursor-pointer">
                <span className="text-sm font-medium">Nearby Jobs</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Completed */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-green-600"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${dashboardStats.profileCompletion}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-green-600">{dashboardStats.profileCompletion}%</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Profile Completed</h3>
                <p className="text-sm text-gray-600 mb-3">Complete & organized profile may help to get better response.</p>
                <div className="flex items-center text-green-600 hover:text-green-700 cursor-pointer">
                  <span className="text-sm font-medium">Update Profile</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSection;
