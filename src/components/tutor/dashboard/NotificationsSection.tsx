"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCircle,
  Trash2,
  RefreshCw,
  AlertCircle,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext.next";
import {
  useGetAllNotificationByRoleQuery,
  useDeleteNotificationMutation,
  useUpdateNotificationMutation,
} from "@/redux/features/notification/notificationApi";

// Interface based on your backend response
interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  readStatus: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface NotificationResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Notification[];
}

const NotificationsSection = () => {
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const userId = user?.id;

  // RTK Query hooks
  const {
    data: notificationResponse,
    isLoading: loadingNotification,
    error: fetchError,
    refetch,
  } = useGetAllNotificationByRoleQuery(
    { id: userId },
    {
      skip: !userId,
      refetchOnMountOrArgChange: true,
    }
  );

  const [updateNotification, { isLoading: isUpdating }] = useUpdateNotificationMutation();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();

  // Calculate unread count when data changes
  useEffect(() => {
    if (notificationResponse?.data) {
      const unread = notificationResponse.data.filter(
        (n: Notification) => !n.readStatus
      ).length;
      setUnreadCount(unread);
    }
  }, [notificationResponse]);

  // Handle fetch errors
  useEffect(() => {
    if (fetchError) {
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    }
  }, [fetchError, toast]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await updateNotification({
        id: notificationId,
        data: { readStatus: true }
      }).unwrap();
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Notification marked as read",
          variant: "default",
        });
        // Refetch notifications to get updated list
        refetch();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      // If you have a bulk update endpoint, use it here
      // Otherwise, update each unread notification individually
      const unreadNotifications = notificationResponse?.data?.filter(
        (n: Notification) => !n.readStatus
      ) || [];

      // Use Promise.all to update all unread notifications
      const updatePromises = unreadNotifications.map((notification:any) =>
        updateNotification({
          id: notification.id,
          data: { readStatus: true }
        }).unwrap()
      );

      await Promise.all(updatePromises);
      
      setUnreadCount(0);
      toast({
        title: "Success",
        description: "All notifications marked as read",
        variant: "default",
      });
      // Refetch notifications to get updated list
      refetch();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await deleteNotification(notificationId).unwrap();
      if (response.success) {
        toast({
          title: "Success",
          description: "Notification deleted",
          variant: "default",
        });
        // Refetch notifications to get updated list
        refetch();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  // Get notification badge color based on type
  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      if (diffInMinutes < 1) {
        return "Just now";
      }
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const notifications = notificationResponse?.data || [];
  const isLoading = loadingNotification;

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-4 md:p-6">
      <Card className="bg-white rounded-xl shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-green-600" />
              <CardTitle className="text-xl font-semibold text-gray-800">
                Notifications
              </CardTitle>
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
                onClick={() => refetch()}
                disabled={isLoading || isUpdating}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={isUpdating}
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
              <span className="ml-2 text-gray-600">
                Loading notifications...
              </span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-500">
                You'll see important updates and messages here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    notification.readStatus
                      ? "bg-gray-50 border-gray-200"
                      : "bg-white border-green-200 shadow-sm"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <h4
                            className={`font-medium ${
                              notification.readStatus
                                ? "text-gray-700"
                                : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getNotificationBadgeColor(
                                notification.type
                              )}`}
                            >
                              {notification.type}
                            </Badge>
                            {!notification.readStatus && (
                              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p
                          className={`text-sm ${
                            notification.readStatus
                              ? "text-gray-600"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-4 justify-end sm:justify-start">
                      {!notification.readStatus && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={isUpdating}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Mark as read"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteNotification(notification.id)
                        }
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete notification"
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