'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, X, Trash2, RefreshCw, AlertCircle, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { notificationService, Notification } from '@/services/notificationService';

const NotificationsSection = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await notificationService.getNotifications();
      if (response.success) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.read_status).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read_status: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setIsMarkingAllRead(true);
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read_status: true }))
        );
        setUnreadCount(0);
        toast({
          title: 'Success',
          description: 'All notifications marked as read',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive'
      });
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await notificationService.deleteNotification(notificationId);
      if (response.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        // Update unread count if the deleted notification was unread
        const deletedNotification = notifications.find(n => n.id === notificationId);
        if (deletedNotification && !deletedNotification.read_status) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        toast({
          title: 'Success',
          description: 'Notification deleted',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive'
      });
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  // Get notification badge color based on type
  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-4">
      <Card className="bg-white rounded-xl shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-green-600" />
              <CardTitle className="text-xl font-semibold text-gray-800">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNotifications}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={isMarkingAllRead}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-500">You'll see important updates and messages here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    notification.read_status 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-white border-green-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${
                            notification.read_status ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h4>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getNotificationBadgeColor(notification.type)}`}
                          >
                            {notification.type}
                          </Badge>
                          {!notification.read_status && (
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          )}
                        </div>
                        <p className={`text-sm ${
                          notification.read_status ? 'text-gray-600' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!notification.read_status && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsSection;
