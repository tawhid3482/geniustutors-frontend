import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { Menu, X, BarChart3, Users, Settings, User, LogOut } from 'lucide-react';
import UserRoleSection from './sections/UserRoleSection';
import PlatformControlSection from './sections/PlatformControlSection';
import DashboardOverview from './sections/DashboardOverview';
import ProfileSection from './sections/ProfileSection';
import { useSuperAdminDashboard } from '@/hooks/useSuperAdminDashboard';
import { Button } from '@/components/ui/button';
import { AdminProfile } from '../admin/components/AdminProfile';
import TuitionRequestsSection from '../admin/sections/TuitionRequestsSection';
import TutorConnectSection from '../admin/sections/TutorConnectSection';
import { UserManagementSection } from '../admin/components/UserManagementSection';
import { TutorManagementSection } from '../admin/components/TutorManagementSection';
import UpgradePackagesManagement from '../admin/components/UpgradePackagesManagement';
import ManageDistrict from '../admin/components/ManageDistrict';
import { ReviewManagementSection } from '../admin/components/ReviewManagementSection';
import { PaymentManagementSection } from '../admin/components/PaymentManagementSection';
import CourseManagement from '../admin/CourseManagement';
import { DemoClassesSection } from '../tutor/DemoClassesSection';
import Category from '../admin/components/Category';
import { TutoringHistorySection } from '../tutor/TutoringHistorySection';
import { NoticeBoardSection } from '../admin/sections/NoticeBoardSection';
import ApprovalLettersManagement from '../admin/sections/ApprovalLettersManagement';
import ConfirmationLettersManagement from '../tutor/dashboard/ConfirmationLetterSection';
import AdminNotesSection from '../admin/AdminNotesSection';
import PaymentAccount from '../admin/components/PaymentAccount';
import AppointmentLetter from '../admin/components/AppointmentLetter';
import TutorDocument from '../admin/sections/TutorDocument';
import { TestimonialsManagement } from '../admin/TestimonialsManagement';
import { VideoTestimonialsManagement } from '../admin/VideoTestimonialsManagement';
import FeaturedMediaManagement from '../admin/FeaturedMediaManagement';
import { TuitionJobsSection } from '../admin/sections/TuitionJobsSection';
import AllAppointment from '../admin/components/AllAppointment';
import AdminCreateTuitionRequest from '../admin/components/AdminCreateTuitionRequest';
import TutorDue from '../admin/components/TutorDue';

export function SuperAdminDashboard({ user }: { user: any }) {
  // Add CSS for hidden scrollbar
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
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  const {
    // State
    activeTab,
    setActiveTab,
    // Auth
    handleLogout,
  } = useSuperAdminDashboard();

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Close mobile sidebar when tab changes
  useEffect(() => {
    setShowMobileSidebar(false);
  }, [activeTab]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showMobileSidebar && !target.closest('.mobile-sidebar') && !target.closest('.mobile-sidebar-toggle')) {
        setShowMobileSidebar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileSidebar]);


    // Render profile section
  const renderProfile = () => {
    return (
      <AdminProfile user={user} />
    );
  };

  // Render tuition requests section
  const renderTuitionRequests = () => {
    return (
      <TuitionRequestsSection />
    );
  };
  const renderTuitionConnection = () => {
    return (
      <TutorConnectSection />
    );
  };

  // Render user management section
  const renderUserManagement = () => {
    return (
      <UserManagementSection />
    );
  };

  // Render tutor management section
  const renderTutorManagement = () => {
    return (
      <TutorManagementSection />
    );
  };

  // Render upgrade applications management section
  // const renderUpgradeApplicationsManagement = () => {
  //   return (
  //     <UpgradeApplicationsManagement />
  //   );
  // };

  // Render upgrade packages management section
  const renderUpgradePackagesManagement = () => {
    return (
      <UpgradePackagesManagement />
    );
  };

  // Render district management section
  const renderDistrictManagement = () => {
    return (
      <ManageDistrict />
    );
  };
  // Render review management section
  const renderReviewManagement = () => {
    return (
      <ReviewManagementSection />
    );
  };

  // Render payment management section
  const renderPaymentManagement = () => {
    return (
      <PaymentManagementSection />
    );
  };

  // Render course management section
  const renderCourseManagement = () => {
    return (
      <CourseManagement />
    );
  };

  // Render permission assignment section
  // const renderPermissionAssignment = () => {
  //   return (
  //     <PermissionAssignment />
  //   );
  // };

  // Render demo classes section


  // Render platform control section
  const renderPlatformControl = () => {
    return (
      <PlatformControlSection />
    );
  };

  // Render taxonomy management section
  const renderTaxonomyManagement = () => {
    return (
      <Category />
    );
  };

  // Render history section
  const renderHistory = () => {
    return (
      <TutoringHistorySection />
    );
  };

  // Render notice board section
  const renderNoticeBoard = () => {
    return <NoticeBoardSection />;
  };

  // Render approval letters management section
  const renderApprovalLetters = () => {
    return <ApprovalLettersManagement />;
  };

  // Render confirmation letters management section
  const renderConfirmationLetters = () => {
    return <ConfirmationLettersManagement />;
  };

  // Render admin notes section
  const renderNotes = () => {
    return <AdminNotesSection />;
  };
  const renderPaymentAccount = () => {
    return <PaymentAccount />;
  };

  const renderAppointmentLetter = () => {
    return <AppointmentLetter />;
  };
  const renderTutorDocument = () => {
    return <TutorDocument />;
  };

  

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 w-full super-admin-dashboard">
      {/* Sticky Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 lg:w-80 md:fixed md:inset-y-0 md:z-50 bg-white border-r border-gray-200 shadow-lg">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Sidebar Header - Connected to Navbar */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Super Admin</span>
            </div>
          </div>

          
          
          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            <DashboardSidebar 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onLogout={handleLogout}
              role="SUPER_ADMIN"
            />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="md:pl-64 lg:pl-80 flex flex-col flex-1 min-w-0 w-full">
        {/* Sticky Navbar */}
        <DashboardNavbar 
          user={user ? {
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            avatar: user.avatar
          } : undefined}
          onLogout={handleLogout}
          onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
          showMobileSidebar={showMobileSidebar}
        />
        
       {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 w-full main-content">
          <div className="w-full max-w-none content-container">
           
            {activeTab === "profile" && renderProfile()}
            {activeTab === "tution-request" && renderTuitionRequests()}
            {activeTab === "tutor-connect" && renderTuitionConnection()}
            {activeTab === "users" && renderUserManagement()}
            {activeTab === "tutors" && renderTutorManagement()}
            {/* {activeTab === "tutor-applications" && <ContactRequests />}
            {activeTab === "upgrade-applications" && renderUpgradeApplicationsManagement()} */}
            {activeTab === "upgrade-packages" && renderUpgradePackagesManagement()}
            {activeTab === "district" && renderDistrictManagement()}
            {activeTab === "reviews" && renderReviewManagement()}
            {activeTab === "payment" && renderPaymentManagement()}
            {/* {activeTab === "refund-policies" && <RefundPoliciesPage />} */}
            {activeTab === "courses" && renderCourseManagement()}
            {activeTab === "testimonials" && <TestimonialsManagement />}
            {activeTab === "video-testimonials" && <VideoTestimonialsManagement />}
            {activeTab === "featured-media" && <FeaturedMediaManagement />}
            {/* {activeTab === "permission-assignment" && renderPermissionAssignment()} */}
            {activeTab === "seo-analytics" && renderPlatformControl()}
            {activeTab === "taxonomy" && renderTaxonomyManagement()}
            {activeTab === "history" && renderHistory()}
            {activeTab === "notice-board" && renderNoticeBoard()}
            {activeTab === "approval-letter" && renderApprovalLetters()}
            {activeTab === "confirmation-letter" && renderConfirmationLetters()}
            {activeTab === "notes" && renderNotes()}
            {activeTab === "appointment-letter" && renderAppointmentLetter()}
            {activeTab === "payment-account" && renderPaymentAccount()}
            {activeTab === "tuition-jobs" && <TuitionJobsSection />}
            {activeTab === "appointment" && <AllAppointment />}
            {activeTab === "document" && renderTutorDocument()}
            {activeTab === "admin-tuition-request" && <AdminCreateTuitionRequest />}
            {activeTab === "due" && <TutorDue />}
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
              <h2 className="text-lg font-semibold text-gray-900">Super Admin Menu</h2>
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
                role="SUPER_ADMIN"
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default SuperAdminDashboard;
