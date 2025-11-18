import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSuperAdminDashboard } from '@/hooks/useSuperAdminDashboard';
import { Activity, Users, DollarSign, BookOpen, AlertTriangle, CheckCircle, UserPlus, RefreshCw, Clock } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

interface DashboardOverviewProps {
  onTabChange?: (tab: string) => void;
}

export default function DashboardOverview({ onTabChange }: DashboardOverviewProps) {
  const { 
    stats, 
    loading, 
    setActiveTab, 
    recentUsers, 
    recentUsersLoading,
    fetchRecentUsers 
  } = useSuperAdminDashboard();

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // Use the passed onTabChange prop if available, otherwise use the hook's setActiveTab
  const handleTabChange = onTabChange || setActiveTab;

  // Transform recent users data for display
  const displayUsers = recentUsers.map(user => ({
    ...user,
    timeAgo: user.lastActive,
  }));

  // Fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/activity-logs?limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setRecentActivities(response.data.data.logs);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivities();
  }, []);
  
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Welcome to the Super Admin Dashboard. Here's an overview of your platform's performance.
        </p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          // Loading skeleton for stats
          Array(4).fill(0).map((_, index) => (
            <Card key={index} className="bg-gray-50 border-none shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-3 sm:h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-5 sm:h-6 bg-gray-300 rounded mb-1"></div>
                      <div className="h-2 sm:h-3 bg-gray-300 rounded"></div>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((stat, index) => {
            const iconName = stat.title === 'Total Users' ? Users :
                           stat.title === 'Platform Revenue' ? DollarSign :
                           stat.title === 'Active Sessions' ? Activity :
                           stat.title === 'Total Tuition Requests' ? BookOpen :
                           CheckCircle;
            const Icon = iconName;
            const color = stat.title === 'Total Users' ? 'bg-blue-50' :
                         stat.title === 'Platform Revenue' ? 'bg-green-50' :
                         stat.title === 'Active Sessions' ? 'bg-purple-50' :
                         stat.title === 'Total Tuition Requests' ? 'bg-orange-50' :
                         'bg-emerald-50';
            
            return (
              <Card key={index} className={`${color} border-none shadow-sm hover:shadow-md transition-shadow duration-200`}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">{stat.title}</p>
                      <h3 className="text-lg sm:text-2xl font-bold truncate">{stat.value}</h3>
                      <p className="text-xs text-green-600 mt-1 truncate">{stat.change} from last month</p>
                    </div>
                    <div className="p-2 rounded-full bg-white/80 flex-shrink-0 ml-2">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      
      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="h-fit">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Latest actions on the platform</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchRecentActivities}
                disabled={activitiesLoading}
                className="h-8 w-8 flex-shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${activitiesLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-sm sm:text-base text-muted-foreground">Loading recent activities...</span>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Activity className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm sm:text-base">No recent activities found</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4 border-b last:border-0 last:pb-0">
                    <div className="p-1.5 sm:p-2 rounded-full bg-blue-50 flex-shrink-0">
                      <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{activity.action}</p>
                      <div className="flex flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="truncate">{new Date(activity.created_at).toLocaleString()}</span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">{activity.user_name || 'System'}</span>
                        {activity.severity && activity.severity !== 'low' && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <Badge 
                              variant={activity.severity === 'critical' ? 'destructive' : 
                                      activity.severity === 'high' ? 'destructive' : 'secondary'}
                              className="text-xs px-1.5 py-0.5"
                            >
                              {activity.severity}
                            </Badge>
                          </>
                        )}
                      </div>
                      {activity.details && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">{activity.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="h-fit">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  Recent Users
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Recently registered and active users</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchRecentUsers}
                disabled={recentUsersLoading}
                className="h-8 w-8 flex-shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${recentUsersLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentUsersLoading ? (
              <div className="flex items-center justify-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-sm sm:text-base text-muted-foreground">Loading recent users...</span>
              </div>
            ) : displayUsers.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <UserPlus className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm sm:text-base">No recent users found</p>
                <Button 
                  variant="outline" 
                  className="mt-2 text-xs sm:text-sm" 
                  onClick={fetchRecentUsers}
                >
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {displayUsers.map((user, index) => {
                let statusIcon = CheckCircle;
                let statusColor = 'text-green-500 bg-green-50';
                
                if (user.status === 'suspended') {
                  statusIcon = AlertTriangle;
                  statusColor = 'text-red-500 bg-red-50';
                } else if (user.status === 'pending') {
                  statusIcon = Activity;
                  statusColor = 'text-amber-500 bg-amber-50';
                }
                
                const StatusIcon = statusIcon;
                
                return (
                  <div key={index} className="flex items-center justify-between pb-3 sm:pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className={`p-1.5 sm:p-2 rounded-full ${statusColor.split(' ')[1]} flex-shrink-0`}>
                        <StatusIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${statusColor.split(' ')[0]}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1">
                          <p className="font-medium text-sm sm:text-base truncate">{user.name}</p>
                          <Badge className={`text-xs px-1.5 py-0.5 flex-shrink-0 ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'tutor' ? 'bg-green-100 text-green-800' :
                            user.role === 'student' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                          <span className="truncate">{user.email}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate">Active {user.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={user.status === 'active' ? 'default' : user.status === 'suspended' ? 'destructive' : 'secondary'}
                      className="capitalize text-xs flex-shrink-0"
                    >
                      {user.status}
                    </Badge>
                  </div>
                );
              })}
              </div>
            )}
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full text-xs sm:text-sm" 
                onClick={() => handleTabChange('users')}
              >
                View All Users
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}