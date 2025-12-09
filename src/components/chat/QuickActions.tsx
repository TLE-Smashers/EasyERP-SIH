'use client';

import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Calendar, 
  CreditCard, 
  GraduationCap, 
  HelpCircle,
  Hotel,
  Users,
  FileText,
  TrendingUp,
  ClipboardList,
  DollarSign,
  UserCheck
} from 'lucide-react';
import type { UserRole } from '@/types/auth';

interface QuickActionsProps {
  onAction: (action: string) => void;
  userRole?: UserRole;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  query: string;
}

export function QuickActions({ onAction, userRole }: QuickActionsProps) {
  // Role-specific actions
  const getRoleActions = (): QuickAction[] => {
    switch (userRole) {
      case 'student':
        return [
          {
            label: 'Attendance',
            icon: <Calendar className="h-4 w-4" />,
            query: 'Show my attendance',
          },
          {
            label: 'Marks',
            icon: <GraduationCap className="h-4 w-4" />,
            query: 'What are my marks?',
          },
          {
            label: 'Library',
            icon: <BookOpen className="h-4 w-4" />,
            query: 'Which books do I have issued?',
          },
          {
            label: 'Fees',
            icon: <CreditCard className="h-4 w-4" />,
            query: 'What is my fee status?',
          },
          {
            label: 'Hostel',
            icon: <Hotel className="h-4 w-4" />,
            query: 'Show my hostel details',
          },
          {
            label: 'Help',
            icon: <HelpCircle className="h-4 w-4" />,
            query: 'How can you help me?',
          },
        ];

      case 'faculty':
        return [
          {
            label: 'Attendance',
            icon: <Calendar className="h-4 w-4" />,
            query: 'Show today\'s attendance summary',
          },
          {
            label: 'My Marks',
            icon: <GraduationCap className="h-4 w-4" />,
            query: 'Show marks I uploaded',
          },
          {
            label: 'Students',
            icon: <Users className="h-4 w-4" />,
            query: 'List all students in my class',
          },
          {
            label: 'Absent',
            icon: <UserCheck className="h-4 w-4" />,
            query: 'Who are absent today?',
          },
          {
            label: 'Performance',
            icon: <TrendingUp className="h-4 w-4" />,
            query: 'Show class performance report',
          },
          {
            label: 'Help',
            icon: <HelpCircle className="h-4 w-4" />,
            query: 'What can you help me with?',
          },
        ];

      case 'librarian':
        return [
          {
            label: 'Books',
            icon: <BookOpen className="h-4 w-4" />,
            query: 'Show total books in catalog',
          },
          {
            label: 'Issues',
            icon: <ClipboardList className="h-4 w-4" />,
            query: 'Show all active book issues',
          },
          {
            label: 'Overdue',
            icon: <Calendar className="h-4 w-4" />,
            query: 'List overdue books',
          },
          {
            label: 'Requests',
            icon: <FileText className="h-4 w-4" />,
            query: 'Show pending book requests',
          },
          {
            label: 'Search',
            icon: <BookOpen className="h-4 w-4" />,
            query: 'Check book availability',
          },
          {
            label: 'Help',
            icon: <HelpCircle className="h-4 w-4" />,
            query: 'What library queries can you handle?',
          },
        ];

      case 'admission':
        return [
          {
            label: 'Applications',
            icon: <FileText className="h-4 w-4" />,
            query: 'Show total admission applications',
          },
          {
            label: 'Pending',
            icon: <ClipboardList className="h-4 w-4" />,
            query: 'List pending verifications',
          },
          {
            label: 'Admitted',
            icon: <Users className="h-4 w-4" />,
            query: 'Show admitted students',
          },
          {
            label: 'Summary',
            icon: <TrendingUp className="h-4 w-4" />,
            query: 'Branch-wise admission summary',
          },
          {
            label: 'Documents',
            icon: <FileText className="h-4 w-4" />,
            query: 'Show document verification status',
          },
          {
            label: 'Help',
            icon: <HelpCircle className="h-4 w-4" />,
            query: 'What admission queries can you handle?',
          },
        ];

      case 'accountant':
        return [
          {
            label: 'Payments',
            icon: <DollarSign className="h-4 w-4" />,
            query: 'Show today\'s payment collections',
          },
          {
            label: 'Pending',
            icon: <CreditCard className="h-4 w-4" />,
            query: 'List pending fee payments',
          },
          {
            label: 'Dues',
            icon: <FileText className="h-4 w-4" />,
            query: 'Show outstanding dues',
          },
          {
            label: 'Summary',
            icon: <TrendingUp className="h-4 w-4" />,
            query: 'Generate collection summary',
          },
          {
            label: 'Branch Fees',
            icon: <ClipboardList className="h-4 w-4" />,
            query: 'Branch-wise fee status',
          },
          {
            label: 'Help',
            icon: <HelpCircle className="h-4 w-4" />,
            query: 'What financial queries can you handle?',
          },
        ];

      case 'admin':
        return [
          {
            label: 'Students',
            icon: <Users className="h-4 w-4" />,
            query: 'Show total students',
          },
          {
            label: 'Faculty',
            icon: <UserCheck className="h-4 w-4" />,
            query: 'Show faculty statistics',
          },
          {
            label: 'Admissions',
            icon: <FileText className="h-4 w-4" />,
            query: 'Admission summary',
          },
          {
            label: 'Payments',
            icon: <DollarSign className="h-4 w-4" />,
            query: 'Financial overview',
          },
          {
            label: 'Reports',
            icon: <TrendingUp className="h-4 w-4" />,
            query: 'Generate system reports',
          },
          {
            label: 'Help',
            icon: <HelpCircle className="h-4 w-4" />,
            query: 'What system queries can you handle?',
          },
        ];

      default:
        return [
          {
            label: 'Help',
            icon: <HelpCircle className="h-4 w-4" />,
            query: 'How can you help me?',
          },
        ];
    }
  };

  const actions = getRoleActions();

  return (
    <div className="grid grid-cols-3 gap-2">{actions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onAction(action.query)}
          className="h-auto py-2 px-2 flex flex-col items-center gap-1"
        >
          {action.icon}
          <span className="text-xs">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
