"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListFilter, Users, CheckCircle2, CreditCard, Star, User, Megaphone, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { noticeBoardService, Notice } from "@/services/noticeBoardService";

interface StudentOverviewProps {
  profile: any;
  requestsPostedCount: number;
  tutorRequestedCount: number;
  tutorAssignedCount: number;
  paymentsProcessedCount: number;
  postedRequests: any[];
  recentPlatformJobs: any[];
  topRatedTutors: any[];
  setActiveTab: (tab: string) => void;
  inviteDemo: (tutor: any) => void;
}

export function StudentOverview({
  profile,
  requestsPostedCount,
  tutorRequestedCount,
  tutorAssignedCount,
  paymentsProcessedCount,
  postedRequests,
  recentPlatformJobs,
  topRatedTutors,
  setActiveTab,
  inviteDemo
}: StudentOverviewProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(true);

  const overviewStats = useMemo(
    () => [
      { label: "Requests", value: requestsPostedCount, icon: ListFilter },
      { label: "Demo Invites", value: tutorRequestedCount, icon: Users },
      { label: "Assigned", value: tutorAssignedCount, icon: CheckCircle2 },
      { label: "Paid", value: paymentsProcessedCount, icon: CreditCard },
    ],
    [requestsPostedCount, tutorRequestedCount, tutorAssignedCount, paymentsProcessedCount]
  );

  // Fetch student notices on component mount
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoadingNotices(true);
        const response = await noticeBoardService.getStudentNotices();
        if (response.success) {
          setNotices(response.data);
        }
      } catch (error) {
        console.error('Error fetching notices:', error);
      } finally {
        setLoadingNotices(false);
      }
    };

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

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="rounded-2xl bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Welcome back, {profile.name.split(" ")[0]} 👋</h2>
            <p className="text-white/90 mt-1 text-sm sm:text-base">Here is a quick snapshot of your learning journey.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="bg-white text-green-700 hover:bg-green-50 text-sm sm:text-base" onClick={() => setActiveTab("request")}>Post a Request</Button>
          </div>
        </div>
      </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {overviewStats.map((s) => (
          <Card key={s.label} className="border-green-100/60 hover:shadow-md transition-all">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs sm:text-sm text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Recent Tuition Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPlatformJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm sm:text-base">{job.subject || job.title || 'Tuition Request'}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {job.district && job.area ? `${job.district} • ${job.area}` : job.location || 'Location not specified'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(job.createdAt || job.created_at).toLocaleDateString()}
                    </div>
                    {job.salary && (
                      <div className="text-xs text-green-600 font-medium">
                        ৳{job.salary}
                        {job.isSalaryNegotiable && ' (Negotiable)'}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={job.status === 'Active' ? "bg-green-600" : job.status === 'Completed' ? "bg-blue-600" : "bg-gray-600"}>
                      {job.status}
                    </Badge>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {job.matchedTutors ? job.matchedTutors.length : 0} matches
                    </span>
                  </div>
                </div>
              ))}
              {recentPlatformJobs.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No recent tuition jobs available</p>
                  <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700" onClick={() => setActiveTab("search")}>
                    Find Tutors
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Top Rated Tutors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRatedTutors.slice(0, 5).map((tutor) => (
                <div key={tutor.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm sm:text-base">{tutor.full_name || tutor.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {typeof tutor.subjects === 'string' ? tutor.subjects : Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : 'Multiple Subjects'} • {tutor.area || tutor.district}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs text-muted-foreground">{tutor.rating || 'N/A'}</span>
                        {tutor.experience && (
                          <span className="text-xs text-muted-foreground ml-2">• {tutor.experience} years exp</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-1 text-xs sm:text-sm" 
                      onClick={() => window.open(`/tutor/${tutor.id}`, '_blank')}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
              {topRatedTutors.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No top-rated tutors available</p>
                  <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700" onClick={() => setActiveTab("search")}>
                    Find Tutors
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
