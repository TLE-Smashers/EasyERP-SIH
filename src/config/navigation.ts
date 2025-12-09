import { UserRole } from "@/types/auth"
import {
  BookOpen,
  Calendar,
  CalendarCheck,
  ClipboardCheck,
  GraduationCap,
  Home,
  Hotel,
  Library,
  Settings,
  Users,
  Wallet,
  Bell,
  Share2,
  LucideIcon,
  Briefcase,
  Award,
  UserPlus,
  TrendingUp,
  Building2,
  Database,
  Network,
  Shield,
  BarChart3,
  Globe,
  FileText,
  Cloud,
  Lock,
  MessageCircle,
  UserCheck,
} from "lucide-react"

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  isSettings?: boolean // Mark items that are settings/system
  items?: {
    title: string
    url: string
    isActive?: boolean
  }[]
}

/**
 * Alumni Navigation Configuration
 * Navigation items for graduated students
 */
export const alumniNavigation: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard/alumni",
    icon: Home,
  },
  {
    title: "My Profile",
    url: "/dashboard/alumni/profile",
    icon: Users,
  },
  {
    title: "Events",
    url: "/dashboard/alumni/events",
    icon: Calendar,
  },
  {
    title: "Alumni Directory",
    url: "/dashboard/alumni/directory",
    icon: UserPlus,
  },
  {
    title: "My Connections",
    url: "/dashboard/alumni/connections",
    icon: UserCheck,
  },
  {
    title: "Chat",
    url: "/dashboard/alumni/chat",
    icon: MessageCircle,
  },
  {
    title: "Student Referrals",
    url: "/dashboard/alumni/referrals",
    icon: Share2,
  },
]

/**
 * Role-Based Navigation Configuration
 * Defines which modules each role can access
 * Following SOLID principles - Open/Closed for adding new roles
 */
export const roleBasedNavigation: Record<UserRole, NavItem[]> = {
  "super-admin": [
    {
      title: "Dashboard",
      url: "/dashboard/super-admin",
      icon: Home,
    },
    {
      title: "Shared Resources",
      url: "#",
      icon: Share2,
      items: [
        { title: "Browse Resources", url: "/dashboard/shared-resources" },
        { title: "Upload Resources", url: "/dashboard/shared-resources/upload" },
      ],
    },
    {
      title: "Institutions",
      url: "#",
      icon: Building2,
      items: [
        { title: "All Institutions", url: "/dashboard/super-admin/institutions" },
        { title: "Add Institution", url: "/dashboard/super-admin/institutions/new" },
      ],
    },
    // {
    //   title: "Federation Network",
    //   url: "#",
    //   icon: Network,
    //   items: [
    //     { title: "Network Overview", url: "/dashboard/super-admin/federation" },
    //     { title: "Resource Sharing", url: "/dashboard/super-admin/federation/resources" },
    //     { title: "Inter-Institution Transfer", url: "/dashboard/super-admin/federation/transfers" },
    //   ],
    // },
    // {
    //   title: "Global Users",
    //   url: "#",
    //   icon: Users,
    //   items: [
    //     { title: "All Users", url: "/dashboard/super-admin/users" },
    //     { title: "Institution Admins", url: "/dashboard/super-admin/users/admins" },
    //     { title: "Cross-Institution Access", url: "/dashboard/super-admin/users/access" },
    //   ],
    // },
    // {
    //   title: "Analytics & Reports",
    //   url: "#",
    //   icon: BarChart3,
    //   items: [
    //     { title: "System Overview", url: "/dashboard/super-admin/analytics" },
    //     { title: "Institution Performance", url: "/dashboard/super-admin/analytics/institutions" },
    //     { title: "Resource Usage", url: "/dashboard/super-admin/analytics/resources" },
    //     { title: "User Activity", url: "/dashboard/super-admin/analytics/activity" },
    //   ],
    // },
    // {
    //   title: "Data Management",
    //   url: "#",
    //   icon: Database,
    //   items: [
    //     { title: "System Backups", url: "/dashboard/super-admin/data/backups" },
    //     { title: "Data Migration", url: "/dashboard/super-admin/data/migration" },
    //     { title: "Data Sync", url: "/dashboard/super-admin/data/sync" },
    //   ],
    // },
    // {
    //   title: "Security & Access",
    //   url: "#",
    //   icon: Shield,
    //   items: [
    //     { title: "Role Management", url: "/dashboard/super-admin/security/roles" },
    //     { title: "Permissions", url: "/dashboard/super-admin/security/permissions" },
    //     { title: "Audit Logs", url: "/dashboard/super-admin/security/audit" },
    //     { title: "API Keys", url: "/dashboard/super-admin/security/api-keys" },
    //   ],
    // },
    // {
    //   title: "Global Configuration",
    //   url: "#",
    //   icon: Settings,
    //   isSettings: true,
    //   items: [
    //     { title: "System Settings", url: "/dashboard/super-admin/settings" },
    //     { title: "Email Configuration", url: "/dashboard/super-admin/settings/email" },
    //     { title: "Integration Settings", url: "/dashboard/super-admin/settings/integrations" },
    //     { title: "Feature Flags", url: "/dashboard/super-admin/settings/features" },
    //   ],
    // },
    // {
    //   title: "Documentation",
    //   url: "#",
    //   icon: FileText,
    //   items: [
    //     { title: "API Documentation", url: "/dashboard/super-admin/docs/api" },
    //     { title: "Admin Guide", url: "/dashboard/super-admin/docs/guide" },
    //     { title: "Federation Setup", url: "/dashboard/super-admin/docs/federation" },
    //   ],
    // },
  ],
  admin: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Shared Resources",
      url: "#",
      icon: Share2,
      items: [
        { title: "Browse Resources", url: "/dashboard/shared-resources" },
        { title: "Upload Resources", url: "/dashboard/shared-resources/upload" },
      ],
    },
    {
      title: "Admission",
      url: "#",
      icon: GraduationCap,
      items: [
        { title: "Applications", url: "/dashboard/admission/applications" },
        { title: "New Application", url: "/dashboard/admission/new" },
      ],
    },
    {
      title: "Accounts",
      url: "#",
      icon: Wallet,
      items: [
        { title: "Payments", url: "/dashboard/accounts/payments" },
        { title: "Fee Collection", url: "/dashboard/accounts/fees" },
        { title: "Receipts", url: "/dashboard/accounts/receipts" },
      ],
    },
    {
      title: "Hostel",
      url: "#",
      icon: Hotel,
      items: [
        { title: "Allocation", url: "/dashboard/hostel/allocation" },
        { title: "Rooms", url: "/dashboard/hostel/rooms" },
      ],
    },
    {
      title: "Library",
      url: "#",
      icon: Library,
      items: [
        { title: "Pending Requests", url: "/dashboard/library/requests" },
        { title: "Issued Books", url: "/dashboard/library/issues" },
        { title: "Book Catalog", url: "/dashboard/library/books" },
        { title: "E-Books & Resources", url: "/dashboard/library/resources" },
      ],
    },
    {
      title: "Students",
      url: "#",
      icon: Users,
      items: [
        { title: "All Students", url: "/dashboard/students" },
      ],
    },
    {
      title: "Faculty",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "All Faculty", url: "/dashboard/faculty" },
        { title: "Add Faculty", url: "/dashboard/faculty/new" },
      ],
    },
    {
      title: "Leave Management",
      url: "#",
      icon: Calendar,
      items: [
        { title: "Leave Requests", url: "/dashboard/faculty/leave/manage" },
        { title: "Leave Balance", url: "/dashboard/faculty/leave/balance" },
        { title: "Leave Calendar", url: "/dashboard/faculty/leave/calendar" },
      ],
    },
    {
      title: "Attendance",
      url: "/dashboard/faculty/attendance-manage",
      icon: ClipboardCheck,
    },
    {
      title: "Notices",
      url: "/dashboard/admin/notices",
      icon: Bell,
    },
    {
      title: "Alumni Referrals",
      url: "/dashboard/admin/referrals",
      icon: Briefcase,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      isSettings: true,
      items: [
        { title: "General", url: "/dashboard/settings" },
        { title: "Users", url: "/dashboard/settings/users" },
        { title: "Backups", url: "/dashboard/settings/backups" },
      ],
    },
  ],
  admission: [
    {
      title: "Dashboard",
      url: "/dashboard/admission",
      icon: Home,
    },
    {
      title: "Admission",
      url: "#",
      icon: GraduationCap,
      items: [
        { title: "Applications", url: "/dashboard/admission/applications" },
        { title: "New Application", url: "/dashboard/admission/new" },
      ],
    },
  ],
  hostel: [
    {
      title: "Dashboard",
      url: "/dashboard/hostel",
      icon: Home,
    },
    {
      title: "Hostel",
      url: "#",
      icon: Hotel,
      items: [
        { title: "Allocation", url: "/dashboard/hostel/allocation" },
        { title: "Rooms", url: "/dashboard/hostel/rooms" },
      ],
    },
  ],
  accountant: [
    {
      title: "Dashboard",
      url: "/dashboard/accounts",
      icon: Home,
    },
    {
      title: "Accounts",
      url: "#",
      icon: Wallet,
      items: [
        { title: "Fee Collection", url: "/dashboard/accounts/fees" },
        { title: "Receipts", url: "/dashboard/accounts/receipts" },
      ],
    },
  ],
  warden: [
    {
      title: "Dashboard",
      url: "/dashboard/hostel",
      icon: Home,
    },
    {
      title: "Hostel",
      url: "#",
      icon: Hotel,
      items: [
        { title: "Allocation", url: "/dashboard/hostel/allocation" },
        { title: "Rooms", url: "/dashboard/hostel/rooms" },
      ],
    },
  ],
  librarian: [
    {
      title: "Dashboard",
      url: "/dashboard/library",
      icon: Home,
    },
    {
      title: "Library",
      url: "#",
      icon: Library,
      items: [
        { title: "Pending Requests", url: "/dashboard/library/requests" },
        { title: "Issued Books", url: "/dashboard/library/issues" },
        { title: "Book Catalog", url: "/dashboard/library/books" },
        { title: "E-Books & Resources", url: "/dashboard/library/resources" },
      ],
    },
  ],
  student: [
    {
      title: "Dashboard",
      url: "/dashboard/student",
      icon: Home,
    },
    {
      title: "Shared Resources",
      url: "#",
      icon: Share2,
      items: [
        { title: "Browse Resources", url: "/dashboard/shared-resources" },
      ],
    },
    {
      title: "Faculty Consultation",
      url: "#",
      icon: UserCheck,
      items: [
        { title: "Request Faculty", url: "/dashboard/student/faculty-request" },
        { title: "My Requests", url: "/dashboard/student/faculty-request/my-requests" },
      ],
    },
    {
      title: "Exams",
      url: "#",
      icon: Calendar,
      items: [
        { title: "Exam Schedule", url: "/dashboard/student/exams" },
        { title: "Results", url: "/dashboard/student/results" },
      ],
    },
    {
      title: "Library",
      url: "#",
      icon: Library,
      items: [
        { title: "Browse Books", url: "/dashboard/student/library" },
        { title: "My Requests", url: "/dashboard/student/library/requests" },
        { title: "My Books", url: "/dashboard/student/library/my-books" },
        { title: "E-Books & Resources", url: "/dashboard/student/library/resources" },
      ],
    },
    {
      title: "Attendance",
      url: "/dashboard/student/attendance",
      icon: ClipboardCheck,
    },
    {
      title: "Notices",
      url: "/dashboard/student/notices",
      icon: Bell,
    },
    {
      title: "My Profile",
      url: "#",
      icon: Users,
      items: [
        { title: "Personal Info", url: "/dashboard/student/profile" },
        { title: "Academic Records", url: "/dashboard/student/academics" },
        { title: "Fee Status", url: "/dashboard/student/fees" },
      ],
    },
  ],
  faculty: [
    {
      title: "Dashboard",
      url: "/dashboard/faculty",
      icon: Home,
    },
    {
      title: "Shared Resources",
      url: "#",
      icon: Share2,
      items: [
        { title: "Browse Resources", url: "/dashboard/shared-resources" },
        { title: "Upload Resources", url: "/dashboard/shared-resources/upload" },
      ],
    },
    {
      title: "Student Requests",
      url: "/dashboard/faculty/requests",
      icon: MessageCircle,
    },
    {
      title: "My Profile",
      url: "#",
      icon: Users,
      items: [
        { title: "Personal Info", url: "/dashboard/faculty/profile" },
        { title: "My Classes", url: "/dashboard/faculty/classes" },
      ],
    },
    {
      title: "Students",
      url: "#",
      icon: GraduationCap,
      items: [
        { title: "My Students", url: "/dashboard/faculty/students" },
        { title: "Student Attendance", url: "/dashboard/faculty/attendance" },
        { title: "Enter Marks", url: "/dashboard/faculty/marks" },
      ],
    },
    {
      title: "My Leave",
      url: "#",
      icon: Calendar,
      items: [
        { title: "Apply Leave", url: "/dashboard/faculty/leave" },
        { title: "Leave History", url: "/dashboard/faculty/leave/history" },
        { title: "Leave Balance", url: "/dashboard/faculty/leave/my-balance" },
      ],
    },
    {
      title: "My Attendance",
      url: "/dashboard/faculty/my-attendance",
      icon: CalendarCheck,
    },
    {
      title: "Notices",
      url: "/dashboard/faculty/notices",
      icon: Bell,
    },
    {
      title: "Library Resources",
      url: "#",
      icon: Library,
      items: [
        { title: "Browse Resources", url: "/dashboard/faculty/library/resources" },
        { title: "Upload Resources", url: "/dashboard/faculty/library/upload" },
        { title: "My Uploads", url: "/dashboard/faculty/library/my-resources" },
      ],
    },
  ],
}

/**
 * Get navigation items for a specific role
 * @param role - User's role
 * @returns Array of navigation items
 */
export function getNavigationForRole(role: UserRole): NavItem[] {
  return roleBasedNavigation[role] || []
}

/**
 * Get alumni navigation items
 * @returns Array of alumni navigation items
 */
export function getAlumniNavigation(): NavItem[] {
  return alumniNavigation
}
