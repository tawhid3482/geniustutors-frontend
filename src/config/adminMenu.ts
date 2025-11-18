import { MenuItem } from '@/hooks/usePermissionMenu';
import { MessageCircle, FileText, BookOpen } from 'lucide-react'; // Import new icons

export const adminMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'Settings',
    permission: 'Dashboard Overview'
  },
  {
    id: 'tution-request',
    label: 'Tuition Requests',
    icon: 'Briefcase',
    permission: 'Tuition Requests'
  },
  {
    id: 'users',
    label: 'User Management',
    icon: 'Users',
    permission: 'User Management'
  },
  {
    id: 'permission-assignment',
    label: 'Permission Assignment',
    icon: 'Shield',
    permission: 'Permission Assignment'
  },
  {
    id: 'upgrade-applications',
    label: 'Upgrade Applications',
    icon: 'Shield',
    permission: 'Upgrade Applications'
  },
  {
    id: 'upgrade-packages',
    label: 'Package Management',
    icon: 'Settings',
    permission: 'Package Management'
  },
  {
    id: 'tutor-applications',
    label: 'Tutor Applications',
    icon: 'UserCheck',
    permission: 'Tutor Applications'
  },
  {
    id: 'demo-classes',
    label: 'Demo Classes',
    icon: 'BookOpen',
    permission: 'Demo Classes'
  },
  {
    id: 'courses',
    label: 'Course Management',
    icon: 'BookCheck',
    permission: 'Course Management'
  },
  {
    id: 'notice-board',
    label: 'Notice Board',
    icon: 'Megaphone',
    permission: 'Notice Board'
  },
  {
    id: 'payment',
    label: 'Payment Management',
    icon: 'DollarSign',
    permission: 'Payment Management'
  },
  {
    id: 'refund-policies',
    label: 'Refund Policies',
    icon: 'Shield',
    permission: 'Payment Management'
  },
  {
    id: 'platform',
    label: 'Platform Control',
    icon: 'Settings',
    permission: 'Featured Media', // Use one of the platform permissions as the main permission
    subMenus: [
      {
        id: 'seo-analytics',
        label: 'SEO & Analytics',
        icon: 'Tag',
        permission: 'SEO & Analytics'
      },
      {
        id: 'taxonomy',
        label: 'Category',
        icon: 'Code',
        permission: 'Taxonomy'
      },
      {
        id: 'featured-media',
        label: 'Featured Media',
        icon: 'Globe',
        permission: 'Featured Media'
      },
      {
        id: 'video-testimonials',
        label: 'Video Testimonials',
        icon: 'Video',
        permission: 'Video Testimonials'
      },
      {
        id: 'testimonials',
        label: 'Testimonials',
        icon: 'Quote',
        permission: 'Testimonials'
      },
    ]
  },
  {
    id: 'profile',
    label: 'Update Profile',
    icon: 'User'
  },
  {
    id: 'approval-letter',
    label: 'Approval Letter',
    icon: 'FileText',
    permission: 'Approval Letter'
  },
  {
    id: 'confirmation-letter',
    label: 'Confirmation Letter',
    icon: 'FileText',
    permission: 'Confirmation Letter'
  },
  {
    id: 'history',
    label: 'Tutoring History',
    icon: 'History',
    permission: 'History'
  },
  {
    id: 'reviews',
    label: 'Reviews',
    icon: 'Star',
    permission: 'Reviews'
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: 'BookOpen',
    permission: 'Notes'
  },
];

export const managerMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'Settings',
    permission: 'Dashboard Overview'
  },
  {
    id: 'tution-request',
    label: 'Tuition Requests',
    icon: 'Briefcase',
    permission: 'Tuition Requests'
  },
  {
    id: 'users',
    label: 'User Management',
    icon: 'Users',
    permission: 'User Management'
  },
  {
    id: 'permission-assignment',
    label: 'Permission Assignment',
    icon: 'Shield',
    permission: 'Permission Assignment'
  },
  {
    id: 'upgrade-applications',
    label: 'Upgrade Applications',
    icon: 'Shield',
    permission: 'Upgrade Applications'
  },
  {
    id: 'upgrade-packages',
    label: 'Package Management',
    icon: 'Settings',
    permission: 'Package Management'
  },
  {
    id: 'tutor-applications',
    label: 'Tutor Applications',
    icon: 'UserCheck',
    permission: 'Tutor Applications'
  },
  {
    id: 'demo-classes',
    label: 'Demo Classes',
    icon: 'BookOpen',
    permission: 'Demo Classes'
  },
  {
    id: 'courses',
    label: 'Course Management',
    icon: 'BookCheck',
    permission: 'Course Management'
  },
  {
    id: 'notice-board',
    label: 'Notice Board',
    icon: 'Megaphone',
    permission: 'Notice Board'
  },
  {
    id: 'payment',
    label: 'Payment Management',
    icon: 'DollarSign',
    permission: 'Payment Management'
  },
  {
    id: 'refund-policies',
    label: 'Refund Policies',
    icon: 'Shield',
    permission: 'Payment Management'
  },
  {
    id: 'platform',
    label: 'Platform Control',
    icon: 'Settings',
    permission: 'SEO & Analytics', // Use a permission the manager has
    subMenus: [
      {
        id: 'seo-analytics',
        label: 'SEO & Analytics',
        icon: 'Tag',
        permission: 'SEO & Analytics'
      },
      {
        id: 'taxonomy',
        label: 'Category',
        icon: 'Code',
        permission: 'Taxonomy'
      },
      {
        id: 'featured-media',
        label: 'Featured Media',
        icon: 'Globe',
        permission: 'Featured Media'
      },
      {
        id: 'video-testimonials',
        label: 'Video Testimonials',
        icon: 'Video',
        permission: 'Video Testimonials'
      },
      {
        id: 'testimonials',
        label: 'Testimonials',
        icon: 'Quote',
        permission: 'Testimonials'
      },
    ]
  },
  {
    id: 'profile',
    label: 'Update Profile',
    icon: 'User'
  },
  {
    id: 'approval-letter',
    label: 'Approval Letter',
    icon: 'FileText',
    permission: 'Approval Letter'
  },
  {
    id: 'confirmation-letter',
    label: 'Confirmation Letter',
    icon: 'FileText',
    permission: 'Confirmation Letter'
  },
  {
    id: 'history',
    label: 'Tutoring History',
    icon: 'History',
    permission: 'History'
  },
  {
    id: 'reviews',
    label: 'Reviews',
    icon: 'Star',
    permission: 'Reviews'
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: 'BookOpen',
    permission: 'Notes'
  },
];
