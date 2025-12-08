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
  admin: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Shared Resources",
      url: "/dashboard/shared-resources",
      icon: Share2,
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
      url: "#",
      icon: ClipboardCheck,
      items: [
        { title: "Mark Attendance", url: "/dashboard/faculty/attendance-manage" },
      ],
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
      url: "/dashboard/shared-resources",
      icon: Share2,
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
      url: "/dashboard/shared-resources",
      icon: Share2,
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
      url: "#",
      icon: CalendarCheck,
      items: [
        { title: "View Attendance", url: "/dashboard/faculty/my-attendance" },
        { title: "Monthly Report", url: "/dashboard/faculty/my-attendance/monthly" },
      ],
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
