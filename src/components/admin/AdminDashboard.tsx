'use client';

import React from "react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useState, useEffect, useRef } from "react";
import { DashboardOverview } from "./sections/DashboardOverview";
import { JobsControlSection } from "./sections/JobsControlSection";
import { TuitionJobsSection } from "./sections/TuitionJobsSection";
import { Send, Menu, X, ChevronRight, LogOut, Briefcase, BookCheck, Star, Users, Key, Shield, Settings, UserCheck, BookOpen, History, Tag, Code, Globe, Video, Quote, FileText, DollarSign, User, Megaphone, MessageCircle } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { Button } from "@/components/ui/button";
import { AdminProfile } from "./components/AdminProfile";
import { FloatingSupportChat } from "./components/FloatingSupportChat";
import { UserManagementSection } from "./components/UserManagementSection";
import { TutorManagementSection } from "./components/TutorManagementSection";
import { ReviewManagementSection } from "./components/ReviewManagementSection";
import { PaymentManagementSection } from "./components/PaymentManagementSection";
import { CourseManagementSection } from "./components/CourseManagementSection";
import ContactRequests from "./components/ContactRequests";
import UpgradeApplicationsManagement from "./components/UpgradeApplicationsManagement";
import UpgradePackagesManagement from "./components/UpgradePackagesManagement";
import { TestimonialsManagement } from "./TestimonialsManagement";
import { VideoTestimonialsManagement } from "./VideoTestimonialsManagement";
import FeaturedMediaManagement from "./FeaturedMediaManagement";
import CourseManagement from "./CourseManagement";
import { DemoClassesSection } from "./sections/DemoClassesSection";
import PlatformControlSection from "./sections/PlatformControlSection";
import TaxonomyManagement from "./TaxonomyManagement";
import { TutoringHistorySection } from "./sections/TutoringHistorySection";
import { NoticeBoardSection } from "./sections/NoticeBoardSection";
import AdminNotesSection from "./AdminNotesSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePermissionMenu } from "@/hooks/usePermissionMenu";
import { adminMenuItems, managerMenuItems } from "@/config/adminMenu";
import PermissionAssignment from "./PermissionAssignment";
import Category from "./components/Category";
import TuitionRequestsSection from "./sections/TuitionRequestsSection";
import TutorConnectSection from "./sections/TutorConnectSection";
import ManageDistrict from "./components/ManageDistrict";
import PaymentAccount from "./components/PaymentAccount";
import RefoundPolicy from "./components/RefoundPolicy";
import AppointmentLetter from "./components/AppointmentLetter";
import ConfirmationLettersManagement from "./sections/ConfirmationLettersManagement";
import ApprovalLettersManagement from "./sections/ApprovalLettersManagement";
import AllAppointment from "./components/AllAppointment";
import TutorDocument from "./sections/TutorDocument";
// import RefundPoliciesPage from "@/app/admin/refund-policies/page";

// Icon mapping for string to component conversion
const iconMap: { [key: string]: any } = {
  Briefcase,
  BookCheck,
  Star,
  Users,
  Key,
  Shield,
  Settings,
  UserCheck,
  BookOpen,
  History,
  MessageCircle,
  Tag,
  Code,
  Globe,
  Video,
  Quote,
  FileText,
  DollarSign,
  User,
  Megaphone,
};
// Desktop Sidebar Component
function DesktopSidebar({ activeTab, onTabChange, onLogout, menuItems }: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  menuItems: any;
}) {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const toggleMenu = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  if (!menuItems || !Array.isArray(menuItems)) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No menu items available</p>
      </div>
    );
  }

  const renderMenuItem = (item: any) => {
    const hasSubMenus = item.subMenus && item.subMenus.length > 0;
    const isExpanded = expandedMenus.has(item.id);
    
    return (
      <div key={item.id} className="mb-1">
        <button
          onClick={() => {
            if (hasSubMenus) {
              toggleMenu(item.id);
            } else {
              onTabChange(item.id);
            }
          }}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === item.id
              ? 'bg-green-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {item.icon && (
            <div className="mr-3 h-4 w-4">
              {typeof item.icon === 'string' ? 
                (iconMap[item.icon] ? React.createElement(iconMap[item.icon], { className: "h-4 w-4" }) : null) :
                React.createElement(item.icon, { className: "h-4 w-4" })
              }
            </div>
          )}
          <span className="flex-1 text-left">{item.label}</span>
          {hasSubMenus && (
            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          )}
        </button>
        
        {hasSubMenus && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {item.subMenus.map((subItem: any) => (
              <button
                key={subItem.id}
                onClick={() => onTabChange(subItem.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === subItem.id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {subItem.icon && (
                  <div className="mr-3 h-4 w-4">
                    {typeof subItem.icon === 'string' ? 
                      (iconMap[subItem.icon] ? React.createElement(iconMap[subItem.icon], { className: "h-4 w-4" }) : null) :
                      React.createElement(subItem.icon, { className: "h-4 w-4" })
                    }
                  </div>
                )}
                {subItem.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Menu */}
      <div>
        <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Main Menu
        </h3>
        <div className="space-y-1">
          {menuItems.map((item: any) => renderMenuItem(item))}
        </div>
      </div>

      {/* Account */}
      <div>
        <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Account
        </h3>
        <div className="space-y-1">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple Mobile Sidebar Component
function SimpleMobileSidebar({ activeTab, onTabChange, onLogout, menuItems }: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  menuItems: any;
}) {
  if (!menuItems || !Array.isArray(menuItems)) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No menu items available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Menu
        </h3>
        <div className="space-y-1">
          {menuItems.map((item: any) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon && (
                <div className="mr-3 h-5 w-5">
                  {typeof item.icon === 'string' ? 
                    (iconMap[item.icon] ? React.createElement(iconMap[item.icon], { className: "h-5 w-5" }) : null) :
                    React.createElement(item.icon, { className: "h-5 w-5" })
                  }
                </div>
              )}
              {item.label}
            </button>
          ))}
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard({ user: pageUser }: { user: any }) {
    // console.log(pageUser)

  // Use the user from props or from the hook
  const {
    pendingUsers,
    accounts,
    jobs,
    tickets,
    contentItems,
    showAddUserModal,
    setShowAddUserModal,
    newUser,
    setNewUser,
    handleCreateUser,
    showEditUserModal,
    setShowEditUserModal,
    editingUser,
    setEditingUser,
    handleUpdateUser,
    handleApproveUser,
    handleRejectUser,
    handleSuspendUser,
    handleActivateUser,
    handleDeleteUser,
    handleApproveJob,
    handleRejectJob,
    handleFeatureJob,
    handleUnfeatureJob,
    handleDeleteJob,
    chatContacts,
    chatMessages,
    selectedChat,
    setSelectedChat,
    newMessage,
    setNewMessage,
    handleSendMessage,
    handleLogout,
  } = useAdminDashboard();

  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Permission management
  const { hasPermission, filterMenuItems, loading: permissionsLoading } = usePermissionMenu();

  // Handle URL parameters for tab switching
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Ref for chat messages scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, selectedChat]);

  // Use the user from props or create a mock user
  const user = pageUser || {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN',
    avatar: "/images/avatars/admin.png"
  };

    // Get menu items based on user role
  const getMenuItems = () => {
    let menuItems;
    if (user.role === 'MANAGER') {
      menuItems = filterMenuItems(managerMenuItems);
    } else {
      menuItems = filterMenuItems(adminMenuItems);
    }
    
    // If no menu items after filtering (due to permissions), show all items
    if (!menuItems || menuItems.length === 0) {
      if (user.role === 'MANAGER') {
        return managerMenuItems;
      }
      return adminMenuItems;
    }
    
    return menuItems;
  };

  // Check if user can access current tab
  const canAccessTab = (tabId: string): boolean => {
    const menuItems = getMenuItems();
    const findMenuItem = (items: any[], id: string): any => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.subMenus) {
          const found = findMenuItem(item.subMenus, id);
          if (found) return found;
        }
      }
      return null;
    };

    const menuItem = findMenuItem(menuItems, tabId);
    if (!menuItem) return false;
    
    // If no permission required, allow access
    if (!menuItem.permission) return true;
    
    return hasPermission(menuItem.permission);
  };

  // Render dashboard overview section
  const renderDashboard = () => {
    return (
      <DashboardOverview 
        setActiveTab={setActiveTab}
        showAddUserModal={showAddUserModal}
        setShowAddUserModal={setShowAddUserModal}
        newUser={newUser}
        setNewUser={setNewUser}
        showEditUserModal={showEditUserModal}
        setShowEditUserModal={setShowEditUserModal}
        editingUser={editingUser}
        setEditingUser={setEditingUser}
      />
    );
  };

  // Render jobs control section
  const renderJobs = () => {
    return (
      <JobsControlSection 
        jobs={jobs}
        handleApproveJob={handleApproveJob}
        handleRejectJob={handleRejectJob}
        handleFeatureJob={handleFeatureJob}
        handleUnfeatureJob={handleUnfeatureJob}
        handleDeleteJob={handleDeleteJob}
      />
    );
  };

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
  const renderUpgradeApplicationsManagement = () => {
    return (
      <UpgradeApplicationsManagement />
    );
  };

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
  const renderPermissionAssignment = () => {
    return (
      <PermissionAssignment />
    );
  };

  // Render demo classes section
  const renderDemoClasses = () => {
    return (
      <DemoClassesSection />
    );
  };

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
  const renderRefoundPolicy = () => {
    return <RefoundPolicy />;
  };
  const renderAppointmentLetter = () => {
    return <AppointmentLetter />;
  };
  const renderTutorDocument = () => {
    return <TutorDocument />;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 w-full admin-dashboard">
      {/* Sticky Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 lg:w-80 md:fixed md:inset-y-0 md:z-50 bg-white border-r border-gray-200 shadow-lg">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Sidebar Header - Connected to Navbar */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {user.role === 'MANAGER' ? 'Manager' : 'Admin'}
              </span>
            </div>
          </div>
          
          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            <DashboardSidebar 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onLogout={handleLogout}
              role={user.role}
              menuItems={getMenuItems()}
            />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="md:pl-64 lg:pl-80 flex flex-col flex-1 min-w-0 w-full">
        {/* Sticky Navbar */}
        <DashboardNavbar 
          user={user ? {
            fullName: user.fullName || user.fullName,
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
            {activeTab === "dashboard" && renderDashboard()}
            {activeTab === "jobs" && renderJobs()}
            {activeTab === "profile" && renderProfile()}
            {activeTab === "tution-request" && renderTuitionRequests()}
            {activeTab === "tutor-connect" && renderTuitionConnection()}
            {activeTab === "users" && renderUserManagement()}
            {activeTab === "tutors" && renderTutorManagement()}
            {activeTab === "tutor-applications" && <ContactRequests />}
            {activeTab === "upgrade-applications" && renderUpgradeApplicationsManagement()}
            {activeTab === "upgrade-packages" && renderUpgradePackagesManagement()}
            {activeTab === "district" && renderDistrictManagement()}
            {activeTab === "reviews" && renderReviewManagement()}
            {activeTab === "payment" && renderPaymentManagement()}
            {/* {activeTab === "refund-policies" && <RefundPoliciesPage />} */}
            {activeTab === "courses" && renderCourseManagement()}
            {activeTab === "testimonials" && <TestimonialsManagement />}
            {activeTab === "video-testimonials" && <VideoTestimonialsManagement />}
            {activeTab === "featured-media" && <FeaturedMediaManagement />}
            {activeTab === "permission-assignment" && renderPermissionAssignment()}
            {activeTab === "demo-classes" && renderDemoClasses()}
            {activeTab === "seo-analytics" && renderPlatformControl()}
            {activeTab === "taxonomy" && renderTaxonomyManagement()}
            {activeTab === "history" && renderHistory()}
            {activeTab === "notice-board" && renderNoticeBoard()}
            {activeTab === "approval-letter" && renderApprovalLetters()}
            {activeTab === "confirmation-letter" && renderConfirmationLetters()}
            {activeTab === "notes" && renderNotes()}
            {activeTab === "refound" && renderRefoundPolicy()}
            {activeTab === "appointment-letter" && renderAppointmentLetter()}
            {activeTab === "payment-account" && renderPaymentAccount()}
            {activeTab === "tuition-jobs" && <TuitionJobsSection />}
            {activeTab === "appointment" && <AllAppointment />}
            {activeTab === "document" && renderTutorDocument()}
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
              <h2 className="text-lg font-semibold text-gray-900">
                {user.role === 'MANAGER' ? 'Manager Menu' : 'Admin Menu'}
              </h2>
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
                role={user.role}
                menuItems={getMenuItems()}
              />
            </div>
          </aside>
        </div>
      )}
      
      {/* Floating Support Chat Widget */}
      {/* <FloatingSupportChat
        chatContacts={chatContacts}
        chatMessages={chatMessages}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
      /> */}
    </div>
  );
}
