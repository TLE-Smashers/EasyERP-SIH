'use client';

import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Calendar, 
  CreditCard, 
  GraduationCap, 
  HelpCircle,
  Hotel 
} from 'lucide-react';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  query: string;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const defaultActions: QuickAction[] = [
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
      query: 'Which books do I have?',
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

  return (
    <div className="grid grid-cols-3 gap-2">
      {defaultActions.map((action, index) => (
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
