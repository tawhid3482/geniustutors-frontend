 
import {
  BookOpen,
  Search,
  CreditCard,
  Calendar,
  Star,
  MessageSquare,
  User,
  Wallet,
  LogOut,
  Users,
  Settings,
  BarChart3,
  FileText,
  DollarSign,
  Globe,
  Shield,
  Bell,
  List,
  CheckCircle2,
  BookDashed,
  BookCheck,
  Briefcase,
  Quote,
  Video,
  Key,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Tag,
  Code,
  History,
  ClipboardList,
  BellRing,
  FileCheck,
  Users2,
  StickyNote,
  Megaphone,
  MessageCircle,
  Lock,
  Navigation,
  Mail,
  LandPlot,
  X,
  Ticket,
  MailCheck,
  ListChecks,
  PlusCircle,
  Users2Icon,
} from 'lucide-react';
import { useState } from 'react';
import { MenuItem } from '@/hooks/usePermissionMenu';
import { useAuth } from '@/contexts/AuthContext.next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardTitle } from '@/components/ui/card';

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  role: 'STUDENT_GUARDIAN' | 'TUTOR' | 'ADMIN' | "SUPER_ADMIN" ;
  menuItems?: MenuItem[];
}

export function DashboardSidebar({ activeTab, onTabChange, onLogout, role, menuItems }: DashboardSidebarProps) {
 

 
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const { user, profile } = useAuth();
  
  const toggleMenu = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  // Icon mapping
  const iconMap: { [key: string]: any } = {
    BarChart3,
    BookOpen,
    Search,
    CreditCard,
    Calendar,
    Star,
    MessageSquare,
    User,
    Wallet,
    Users,
    Settings,
    FileText,
    DollarSign,
    Globe,
    Shield,
    Bell,
    List,
    CheckCircle2,
    BookDashed,
    BookCheck,
    Briefcase,
    Quote,
    Video,
    Key,
    UserCheck,
    Tag,
    Code,
    History,
    ClipboardList,
    BellRing,
    FileCheck,
    Users2,
    StickyNote,
    Megaphone,
    MessageCircle,
  };

  // Define menu items based on role - FIXED VERSION
  const getMenuItems = () => {
    // Always use role-based menu for now to ensure it works
    return getRoleBasedMenuItems();
  };

  // Separate function for role-based menu items - FIXED
  const getRoleBasedMenuItems = () => {
        const normalizedRole = role?.toUpperCase().trim();
    
    switch (normalizedRole) {
      case 'STUDENT_GUARDIAN':
        return {
          main: [
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'posted-jobs', label: 'Tutor Request', icon: List },
            { id: 'search', label: 'Find Tutors', icon: Search },
            // { id: 'request', label: 'Posted Job', icon: BookOpen },
            { id: 'profile', label: 'Update Profile', icon: User },
            // { id: 'demo-classes', label: 'Demo Class', icon: BookOpen },
            { id: 'approval-letter', label: 'Approval Letter', icon: FileCheck },
            { id: 'courses', label: 'My Course', icon: BookCheck },
            // { id: 'reviews', label: 'Reviews', icon: Star },
          ],
          quick: [
            { id: 'join-community', label: 'Join Our Community', icon: Users2 },
          ],
          account: [
            // { id: 'note', label: 'Notes', icon: StickyNote },
            { id: 'settings', label: 'Settings', icon: Settings },
          ],
        };
      case 'TUTOR':
        return {
          main: [
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'jobs', label: 'Find job', icon: Search },
            { id: 'profile', label: 'Update Profile', icon: User },
            { id: 'notifications', label: 'Notification', icon: BellRing },
            { id: 'confirmation-letter', label: 'Confirmation Letter', icon: FileCheck },
            { id: 'tutoring-history', label: 'Tutoring History', icon: History },
            { id: 'payment-section', label: 'Payment Section', icon: CreditCard },


            { id: 'studentApply', label: 'Student-Apply', icon: BookCheck },
            { id: 'genius-verification', label: 'Genius / Verification Request', icon: Shield },
            // { id: 'applications', label: 'Applications', icon: ClipboardList },
            // { id: 'demo-classes', label: 'Demo Classes', icon: BookOpen },
            // { id: 'assignments', label: 'Assignments', icon: CheckCircle2 },
            // { id: 'courses', label: 'My Course', icon: BookOpen },
            { id: 'reviews', label: 'Reviews', icon: Star },
            { id: 'document', label: 'My Document', icon: FileText },
            { id: 'my-student', label: 'My Student', icon: Users2Icon },
          ],
          quick: [
            { id: 'join-community', label: 'Join Our Community', icon: Users2 },
          ],
          account: [
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'note', label: 'Notes', icon: StickyNote },
          ],
        };
      case 'SUPER_ADMIN':
        return {
          main: [
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'users', label: 'User & Role Management', icon: Users },
             { id: 'tution-request', label: 'Tuition Requests', icon: Briefcase },
            { id: 'admin-tuition-request', label: 'Create Tuition Requests', icon:PlusCircle },
            { id: 'tutor-connect', label: 'Tutor Connect', icon: BookCheck },
            { id: 'users', label: 'User Management', icon: Users },
            // { id: 'role-management', label: 'Role Management', icon: Key },
            { id: 'upgrade-applications', label: 'Upgrade Applications', icon: Shield },
            { id: 'upgrade-packages', label: 'Package Management', icon: Settings },
            { id: 'tutor-applications', label: 'Tutor Applications', icon: UserCheck },
            // { id: 'demo-classes', label: 'Demo Classes', icon: BookOpen },
            // { id: 'courses', label: 'Course Management', icon: BookCheck },
            { id: 'reviews', label: 'Reviews', icon: Star },
            { id: 'district', label: 'District', icon: LandPlot },
            // { id: 'history', label: 'History', icon: History },
            { id: 'appointment-letter', label: 'Appointment Letter', icon: Mail },
            { id: 'notice-board', label: 'Notice Board', icon: Megaphone },
            { id: 'payment-account', label: 'Payment Account', icon: Navigation },
            { id: 'refound', label: 'Refound Policy', icon: Ticket },
            { id: 'appointment', label: 'All Appointment', icon: MailCheck },
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'document', label: 'Document', icon:ListChecks  },
          ],
          quick: [
            { id: 'platform', label: 'Platform Control', icon: Settings },
          ],
          account: [
            { id: 'profile', label: 'Profile', icon: User },
          ],
        };
      case 'ADMIN':
        return {
          main: [
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'tution-request', label: 'Tuition Requests', icon: Briefcase },
            { id: 'admin-tuition-request', label: 'Create Tuition Requests', icon:PlusCircle },
            { id: 'tutor-connect', label: 'Tutor Connect', icon: BookCheck },
            { id: 'users', label: 'User Management', icon: Users },
            // { id: 'role-management', label: 'Role Management', icon: Key },
            { id: 'upgrade-applications', label: 'Upgrade Applications', icon: Shield },
            { id: 'upgrade-packages', label: 'Package Management', icon: Settings },
            { id: 'tutor-applications', label: 'Tutor Applications', icon: UserCheck },
            // { id: 'demo-classes', label: 'Demo Classes', icon: BookOpen },
            // { id: 'courses', label: 'Course Management', icon: BookCheck },
            { id: 'reviews', label: 'Reviews', icon: Star },
            { id: 'district', label: 'District', icon: LandPlot },
            // { id: 'history', label: 'History', icon: History },
            { id: 'appointment-letter', label: 'Appointment Letter', icon: Mail },
            { id: 'notice-board', label: 'Notice Board', icon: Megaphone },
            { id: 'payment-account', label: 'Payment Account', icon: Navigation },
            { id: 'refound', label: 'Refound Policy', icon: Ticket },
            { id: 'appointment', label: 'All Appointment', icon: MailCheck },
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'document', label: 'Document', icon:ListChecks  },
            { id: 'due', label: 'Tutor Due', icon: DollarSign  },
          ],
          quick: [
            { 
              id: 'platform', 
              label: 'Platform Control', 
              icon: Settings,
              subMenus: [
                // { id: 'seo-analytics', label: 'SEO & Analytics', icon: Tag },
                { id: 'taxonomy', label: 'Category', icon: Code },
                // { id: 'featured-media', label: 'Featured Media', icon: Globe },
                { id: 'video-testimonials', label: 'Video Testimonials', icon: Video },
                { id: 'testimonials', label: 'Testimonials', icon: Quote },
              ]
            },
            { id: 'payment', label: 'Payment Management', icon: DollarSign },
          ],
          account: [
            { id: 'profile', label: 'Profile Settings', icon: User },
          ],
        };
      case 'MANAGER':
        return {
          main: [
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'tutors', label: 'Tutor Management', icon: UserCheck },
            { id: 'testimonials', label: 'Testimonials', icon: Quote },
            { id: 'video-testimonials', label: 'Video Testimonials', icon: Video },
            { id: 'featured-media', label: 'Featured Media', icon: Globe },
            { id: 'payments', label: 'Payment Management', icon: DollarSign },
          ],
          quick: [],
          account: [
            { id: 'profile', label: 'Profile Settings', icon: User },
          ],
        };
      default:
        console.warn('❌ Unknown role:', normalizedRole, 'Original role:', role);
        return {
          main: [
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'profile', label: 'Profile', icon: User },
          ],
          quick: [],
          account: [
            { id: 'settings', label: 'Settings', icon: Settings },
          ],
        };
    }
  };

  const resolvedMenuItems = getMenuItems();



  const renderMenuItem = (item: any) => {
    if (!item || !item.id) {
      console.warn('❌ Invalid menu item:', item);
      return null;
    }

    const hasSubMenus = item.subMenus && item.subMenus.length > 0;
    const isExpanded = expandedMenus.has(item.id);
    
    // Get icon component - handle both string and component icons
    const IconComponent = typeof item.icon === 'string' ? iconMap[item.icon] : item.icon;


    return (
      <div key={item.id} className="space-y-1">
        <button
          onClick={() => {
            if (hasSubMenus) {
              toggleMenu(item.id);
            } else {
              onTabChange(item.id);
            }
          }}
          className={`w-full flex items-center px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-green-50 hover:text-green-700 ${
            activeTab === item.id
              ? 'bg-green-600 text-white shadow-md'
              : 'text-gray-700 hover:shadow-sm'
          }`}
        >
          {IconComponent && <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />}
          <span className="font-medium text-xs sm:text-sm lg:text-base flex-1 text-left">{item.label}</span>
          {hasSubMenus && (
            <div className="ml-auto">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
        </button>
        
        {hasSubMenus && isExpanded && (
          <div className="ml-4 space-y-1">
            {item.subMenus.map((subItem: any) => {
              if (!subItem || !subItem.id) {
                console.warn('❌ Invalid submenu item:', subItem);
                return null;
              }
              
              const SubIconComponent = typeof subItem.icon === 'string' ? iconMap[subItem.icon] : subItem.icon;
              return (
                <button
                  key={subItem.id}
                  onClick={() => {
                    onTabChange(subItem.id);
                  }}
                  className={`w-full flex items-center px-2 sm:px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-green-50 hover:text-green-700 ${
                    activeTab === subItem.id
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-600 hover:shadow-sm'
                  }`}
                >
                  {SubIconComponent && <SubIconComponent className="h-4 w-4 mr-3" />}
                  <span className="font-medium text-xs sm:text-sm">{subItem.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Function to format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4 hide-scrollbar smooth-scroll">
        <div className="space-y-6">
     

          {/* Support Team Info (for student role) */}
          {role === 'STUDENT_GUARDIAN' && (
            <div className="flex flex-col items-center text-center p-4 bg-green-600 text-white rounded-lg shadow-md mb-6">
              <CardTitle className="text-xl font-bold text-white mb-1">
                Support Team
              </CardTitle>
              <p className="text-sm text-green-100">
                +8801516-528101
              </p>
            </div>
          )}

          {/* User Profile Info (for all roles) */}
          {user && (
            <div className="flex flex-col items-center text-center p-4 bg-green-600 text-white rounded-lg shadow-md mb-6">
              <Avatar className="h-24 w-24 border-4 border-white mb-3">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.fullName || "User"} />
                <AvatarFallback className="text-3xl font-bold text-green-800 bg-white">
                  {user.fullName?.charAt(0) || user.role?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl font-bold text-white mb-1">
                {user.fullName?.toUpperCase() || user.role?.toUpperCase() || 'User Name'}
              </CardTitle>
              <p className="text-sm text-green-100 mb-1">
                {user.email || 'user@example.com'}
              </p>
              <p className="text-xs text-green-200">
                {user.role === 'TUTOR' && `Tutor ID: ${user.tutor_id || 'N/A'} | `}
                Role: {user.role?.replace(/_/g, ' ').toUpperCase() || 'N/A'} | Since {formatDate(user.createdAt)}
              </p>
            </div>
          )}
          
          {/* Main Menu */}
          {resolvedMenuItems.main.length > 0 ? (
            <div>
              {/* <h3 className="px-2 sm:px-3 text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">
                Main Menu ({resolvedMenuItems.main.length} items)
              </h3> */}
              <div className="space-y-1 sm:space-y-2">
                {resolvedMenuItems.main.map((item) => renderMenuItem(item))}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm text-center">
                ❌ No main menu items available for role: {role}
              </p>
            </div>
          )}
          
          {/* Quick Actions */}
          {resolvedMenuItems.quick.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="px-2 sm:px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">
                Quick Actions 
              </h3>
              <div className="space-y-1 sm:space-y-2">
                {resolvedMenuItems.quick.map((item) => renderMenuItem(item))}
              </div>
            </div>
          )}

          {/* Account */}
          {resolvedMenuItems.account.length > 0 ? (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="px-2 sm:px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">
                Account 
              </h3>
              <div className="space-y-1 sm:space-y-2">
                {resolvedMenuItems.account.map((item) => renderMenuItem(item))}
                <button
                  onClick={onLogout}
                  className="w-full flex items-center px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-red-50 hover:text-red-700 text-red-600 hover:shadow-sm"
                >
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                  <span className="font-medium text-xs sm:text-sm lg:text-base">Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="px-2 sm:px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">
                Account
              </h3>
              <div className="space-y-1 sm:space-y-2">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-red-50 hover:text-red-700 text-red-600 hover:shadow-sm"
                >
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                  <span className="font-medium text-xs sm:text-sm lg:text-base">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}