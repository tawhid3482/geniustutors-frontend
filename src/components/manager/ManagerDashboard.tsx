// 'use client';

// import { useAdminDashboard } from "@/hooks/useAdminDashboard";
// import { useState, useEffect } from "react";
// import { DashboardOverview } from "../admin/sections/DashboardOverview";
// import { Menu, X } from "lucide-react";
// import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
// import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
// import { Button } from "@/components/ui/button";
// import { AdminProfile } from "../admin/components/AdminProfile";
// import { UserManagementSection } from "../admin/components/UserManagementSection";
// import { PaymentManagementSection } from "../admin/components/PaymentManagementSection";
// import { TestimonialsManagement } from "../admin/TestimonialsManagement";
// import { VideoTestimonialsManagement } from "../admin/VideoTestimonialsManagement";
// import FeaturedMediaManagement from "../admin/FeaturedMediaManagement";
// import { usePermissionMenu } from "@/hooks/usePermissionMenu";
// import { managerMenuItems } from "@/config/adminMenu";
// import { TuitionRequestsSection } from "../admin/sections/TuitionRequestsSection";
// import { ReviewManagementSection } from "../admin/components/ReviewManagementSection";
// import ContactRequests from "../admin/components/ContactRequests";
// import { DemoClassesSection } from "../admin/sections/DemoClassesSection";
// import UpgradeApplicationsManagement from "../admin/components/UpgradeApplicationsManagement";
// import UpgradePackagesManagement from "../admin/components/UpgradePackagesManagement";
// import { CourseManagementSection } from "../admin/components/CourseManagementSection";
// import { HistorySection } from "../admin/sections/HistorySection";
// import PlatformControlSection from "../admin/sections/PlatformControlSection";
// import TaxonomyManagement from "../admin/TaxonomyManagement";
// import { NoticeBoardSection } from "../admin/sections/NoticeBoardSection";

// export function ManagerDashboard({ user: pageUser }: { user: any }) {
//   // Use the user from props or from the hook
//   const {
//     pendingUsers,
//     accounts,
//     jobs,
//     tickets,
//     contentItems,
//     showAddUserModal,
//     setShowAddUserModal,
//     newUser,
//     setNewUser,
//     handleCreateUser,
//     showEditUserModal,
//     setShowEditUserModal,
//     editingUser,
//     setEditingUser,
//     handleUpdateUser,
//     handleApproveUser,
//     handleRejectUser,
//     handleSuspendUser,
//     handleActivateUser,
//     handleDeleteUser,
//     handleLogout,
//   } = useAdminDashboard();
  
//   const [activeTab, setActiveTab] = useState("dashboard");
//   const [showMobileSidebar, setShowMobileSidebar] = useState(false);

//   // Permission management
//   const { hasPermission, filterMenuItems, loading: permissionsLoading } = usePermissionMenu();

//   // Handle URL parameters for tab switching
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const urlParams = new URLSearchParams(window.location.search);
//       const tabParam = urlParams.get('tab');
//       if (tabParam) {
//         setActiveTab(tabParam);
//       }
//     }
//   }, []);


  
//   // Close mobile sidebar when tab changes and update URL
//   useEffect(() => {
//     setShowMobileSidebar(false);
    
//     // Update URL with current tab
//     if (typeof window !== 'undefined') {
//       const url = new URL(window.location.href);
//       url.searchParams.set('tab', activeTab);
//       window.history.replaceState({}, '', url.toString());
//     }
//   }, [activeTab]);

//   // Close mobile sidebar when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const target = event.target as HTMLElement;
//       if (showMobileSidebar && !target.closest('.mobile-sidebar')) {
//         setShowMobileSidebar(false);
//       }
//     };

//     if (showMobileSidebar) {
//       document.addEventListener('mousedown', handleClickOutside);
//       return () => document.removeEventListener('mousedown', handleClickOutside);
//     }
//   }, [showMobileSidebar]);
  
//   // Use the user from props or create a mock user
//   const user = pageUser || {
//     name: "Manager User",
//     email: "manager@tutorconnect.com",
//     role: "manager",
//     avatar: "/images/avatars/manager.png"
//   };

//   // Ensure user has the correct structure for RoleProvider
//   const roleUser = user ? {
//     id: user.id || user.user_id,
//     name: user.name || user.full_name,
//     email: user.email,
//     role: user.role,
//     avatar: user.avatar
//   } : null;

//   // Get menu items based on permissions
//   const getMenuItems = () => {
//     return filterMenuItems(managerMenuItems);
//   };

//   // Check if user can access current tab
//   const canAccessTab = (tabId: string): boolean => {
//     const menuItems = getMenuItems();
//     const findMenuItem = (items: any[], id: string): any => {
//       for (const item of items) {
//         if (item.id === id) return item;
//         if (item.subMenus) {
//           const found = findMenuItem(item.subMenus, id);
//           if (found) return found;
//         }
//       }
//       return null;
//     };

//     const menuItem = findMenuItem(menuItems, tabId);
//     if (!menuItem) return false;
    
//     // If no permission required, allow access
//     if (!menuItem.permission) return true;
    
//     return hasPermission(menuItem.permission);
//   };

//   // Render dashboard overview section
//   const renderDashboard = () => {
//     return (
//       <DashboardOverview 
//         setActiveTab={setActiveTab}
//         showAddUserModal={showAddUserModal}
//         setShowAddUserModal={setShowAddUserModal}
//         newUser={newUser}
//         setNewUser={setNewUser}
//         showEditUserModal={showEditUserModal}
//         setShowEditUserModal={setShowEditUserModal}
//         editingUser={editingUser}
//         setEditingUser={setEditingUser}
//       />
//     );
//   };

//   // Render profile section
//   const renderProfile = () => {
//     return (
//       <AdminProfile user={user} />
//     );
//   };

//   // Render user management section
//   const renderUserManagement = () => {
//     return (
//       <UserManagementSection />
//     );
//   };



//   // Render payment management section
//   const renderPaymentManagement = () => {
//     return (
//       <PaymentManagementSection />
//     );
//   };

//   // Render tuition requests section
//   const renderTuitionRequests = () => {
//     return (
//       <TuitionRequestsSection />
//     );
//   };

//   // Render reviews section
//   const renderReviews = () => {
//     return (
//       <ReviewManagementSection />
//     );
//   };

//   // Render tutor applications section
//   const renderTutorApplications = () => {
//     return (
//       <ContactRequests />
//     );
//   };

//   // Render demo classes section
//   const renderDemoClasses = () => {
//     return (
//       <DemoClassesSection />
//     );
//   };

//   // Render upgrade applications section
//   const renderUpgradeApplications = () => {
//     return (
//       <UpgradeApplicationsManagement />
//     );
//   };

//   // Render upgrade packages section
//   const renderUpgradePackages = () => {
//     return (
//       <UpgradePackagesManagement />
//     );
//   };

//   // Render course management section
//   const renderCourseManagement = () => {
//     return (
//       <CourseManagementSection />
//     );
//   };

//   // Render history section
//   const renderHistory = () => {
//     return (
//       <HistorySection />
//     );
//   };

//   // Render platform control section
//   const renderPlatformControl = () => {
//     return (
//       <PlatformControlSection />
//     );
//   };

//   // Render taxonomy management section
//   const renderTaxonomyManagement = () => {
//     return (
//       <TaxonomyManagement />
//     );
//   };

//   // Render notice board section
//   const renderNoticeBoard = () => {
//     return (
//       <NoticeBoardSection />
//     );
//   };

//   // Show loading while permissions are loading
//   if (permissionsLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   // Check if user can access the current tab
//   if (!canAccessTab(activeTab)) {
//     return (
//       <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
//         <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-4">
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
//           <p className="text-gray-600 mb-6">You don't have permission to access this section.</p>
//           <Button 
//             onClick={() => setActiveTab('dashboard')} 
//             className="w-full"
//           >
//             Go to Dashboard
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen overflow-hidden bg-gray-50 w-full manager-dashboard">
//         {/* Sticky Sidebar */}
//         <aside className="hidden md:flex md:flex-col md:w-64 lg:w-80 md:fixed md:inset-y-0 md:z-50 bg-white border-r border-gray-200 shadow-lg">
//           <div className="flex-1 flex flex-col min-h-0">
//             {/* Sidebar Header - Connected to Navbar */}
//             <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
//               <div className="flex items-center space-x-2">
//                 <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
//                   <span className="text-white font-bold text-lg">G</span>
//                 </div>
//                 <span className="text-lg font-bold text-gray-900">Manager</span>
//               </div>
//             </div>
            
//             {/* Sidebar Content */}
//             <div className="flex-1 overflow-y-auto">
//               <DashboardSidebar 
//                 activeTab={activeTab}
//                 onTabChange={setActiveTab}
//                 onLogout={handleLogout}
//                 role={user.role}
//                 menuItems={getMenuItems()}
//               />
//             </div>
//           </div>
//         </aside>

//         {/* Main Content Area */}
//         <div className="md:pl-64 lg:pl-80 flex flex-col flex-1 min-w-0 w-full">
//           {/* Sticky Navbar */}
//           <DashboardNavbar 
//             user={user ? {
//               name: user.name || user.full_name,
//               email: user.email,
//               role: user.role,
//               avatar: user.avatar
//             } : undefined}
//             onLogout={handleLogout}
//             onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
//             showMobileSidebar={showMobileSidebar}
//           />
          
//           {/* Main Content */}
//           <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 w-full main-content">
//             <div className="w-full max-w-none content-container">
//               {activeTab === "dashboard" && renderDashboard()}
//               {activeTab === "profile" && renderProfile()}
//               {activeTab === "tution-request" && renderTuitionRequests()}
//               {activeTab === "reviews" && renderReviews()}
//               {activeTab === "users" && renderUserManagement()}
//               {activeTab === "tutor-applications" && renderTutorApplications()}
//               {activeTab === "demo-classes" && renderDemoClasses()}
//               {activeTab === "upgrade-applications" && renderUpgradeApplications()}
//               {activeTab === "upgrade-packages" && renderUpgradePackages()}
//               {activeTab === "courses" && renderCourseManagement()}
//               {activeTab === "history" && renderHistory()}
//               {activeTab === "testimonials" && <TestimonialsManagement />}
//               {activeTab === "video-testimonials" && <VideoTestimonialsManagement />}
//               {activeTab === "featured-media" && <FeaturedMediaManagement />}
//               {activeTab === "seo-analytics" && renderPlatformControl()}
//               {activeTab === "taxonomy" && renderTaxonomyManagement()}
//               {activeTab === "notice-board" && renderNoticeBoard()}
//               {activeTab === "payment" && renderPaymentManagement()}
//             </div>
//           </main>
//         </div>

//         {/* Mobile Sidebar Overlay */}
//         {showMobileSidebar && (
//           <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setShowMobileSidebar(false)}>
//             <aside 
//               className="mobile-sidebar fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="flex items-center justify-between p-4 border-b border-gray-200 relative z-10">
//                 <h2 className="text-lg font-semibold text-gray-900">Manager Menu</h2>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => setShowMobileSidebar(false)}
//                   className="h-8 w-8 relative z-20"
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//               <div className="overflow-y-auto h-full pb-20 p-4">
//                 <DashboardSidebar 
//                   activeTab={activeTab}
//                   onTabChange={(tab) => {
//                     setActiveTab(tab);
//                     setShowMobileSidebar(false);
//                   }}
//                   onLogout={handleLogout}
//                   role={user.role}
//                   menuItems={getMenuItems()}
//                 />
//               </div>
//             </aside>
//           </div>
//         )}
//       </div>
//   );
// }
