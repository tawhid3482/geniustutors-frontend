import React, { useState, useEffect, useRef } from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { Menu, X } from 'lucide-react';
import ProfileSection from './ProfileSection';
import TutorAssignmentsSection from './TutorAssignmentsSection';
import { DemoClassesSection } from './DemoClassesSection';
import { FloatingTutorChat } from './components/FloatingTutorChat';
import { ReviewsSection } from './ReviewsSection';
import SubscriptionSection from './SubscriptionSection';
import EnhancedUpgradeSection from './EnhancedUpgradeSection';
import CourseManagementSection from './CourseManagementSection';
import ApplicationSection from './ApplicationSection';
import { JoinCommunity } from './JoinCommunity';
import { useAuth } from '@/contexts/AuthContext.next';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/config/api';
import { tutorChatService } from '@/services/tutorChatService';
import { ChatContact, ChatMessage } from '@/types/student';
import { useTutorChat } from '@/hooks/useTutorChat';

// Import dashboard sections
import {
  DashboardSection,
  JobsSection,
  ChatSection,
  NotificationsSection,
  ConfirmationLetterSection,
  NoteSection,
  SettingsSection
} from './dashboard';

// Import new sections
import { TutoringHistorySection } from './TutoringHistorySection';
import { PaymentSection } from './PaymentSection';
import StudentApply from './dashboard/StudentApply';



export function TutorDashboard() {
  // Add CSS for enhanced scrolling
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Hide scrollbar for Chrome, Safari and Opera */
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      /* Hide scrollbar for IE, Edge and Firefox */
      .hide-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
      
      /* Custom scrollbar styles */
      .scrollbar-thin::-webkit-scrollbar {
        width: 6px;
      }
      
      .scrollbar-thin::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 3px;
      }
      
      .scrollbar-thin::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }
      
      .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
      
      /* Smooth scrolling */
      .smooth-scroll {
        scroll-behavior: smooth;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showMobileSidebar && !target.closest('.mobile-sidebar')) {
        setShowMobileSidebar(false);
      }
    };

    if (showMobileSidebar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMobileSidebar]);

  const { signOut, user } = useAuth();
  const { toast } = useToast();


  // Initialize chat functionality
  const {
    chatContacts,
    chatMessages,
    selectedChat,
    newMessage,
    setSelectedChat,
    setNewMessage,
    sendMessage,
  } = useTutorChat();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 w-full tutor-dashboard">
      {/* Sticky Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 lg:w-80 md:fixed md:inset-y-0 md:z-50 bg-white border-r border-gray-200 shadow-lg">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Sidebar Header - Connected to Navbar */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Tutor</span>
            </div>
          </div>
          
          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            <DashboardSidebar 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onLogout={handleLogout}
              role="TUTOR"
            />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="md:pl-64 lg:pl-80 flex flex-col flex-1 min-w-0 w-full">
        {/* Sticky Navbar */}
        <DashboardNavbar 
          user={{
            id: user?.id,
            fullName: user?.fullName || 'Tutor',
            email: user?.email || '',
            role: 'TUTOR',
            avatar: user?.avatar
          }} 
          onLogout={handleLogout}
          onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
          showMobileSidebar={showMobileSidebar}
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 w-full main-content">
          <div className="w-full max-w-none content-container">
            {activeTab === "profile" && <ProfileSection />}
            {activeTab === "dashboard" && <DashboardSection />}
            {activeTab === "courses" && <CourseManagementSection />}
            {activeTab === "jobs" && <JobsSection />}
            {activeTab === "applications" && <ApplicationSection />}
            
            {activeTab === "chat" && <ChatSection />}
            {activeTab === "reviews" && <ReviewsSection />}
            {activeTab === "studentApply" && <StudentApply />}
            {activeTab === "assignments" && <TutorAssignmentsSection />}
            {activeTab === "demo-classes" && <DemoClassesSection tutorId={user?.id || ''} />}
            {activeTab === "subscription" && <EnhancedUpgradeSection />}
            {activeTab === "notifications" && <NotificationsSection />}
            {activeTab === "confirmation-letter" && <ConfirmationLetterSection />}
            {activeTab === "tutoring-history" && <TutoringHistorySection />}
            {activeTab === "payment-section" && <PaymentSection />}
            {activeTab === "genius-verification" && <EnhancedUpgradeSection />}
            {activeTab === "join-community" && <JoinCommunity />}
            {activeTab === "note" && <NoteSection />}
            {activeTab === "settings" && <SettingsSection />}

          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setShowMobileSidebar(false)}>
          <aside 
            className="mobile-sidebar fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 relative z-10">
              <h2 className="text-lg font-semibold text-gray-900">Tutor Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileSidebar(false)}
                className="h-8 w-8 relative z-20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto h-full pb-20 p-4">
              <DashboardSidebar 
                activeTab={activeTab}
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  setShowMobileSidebar(false);
                }}
                onLogout={handleLogout}
                role="TUTOR"
              />
            </div>
          </aside>
        </div>
      )}
      
      
    </div>
  );
}

export default TutorDashboard;

