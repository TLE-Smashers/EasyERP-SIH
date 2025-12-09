/**
 * Intent Classifier for AI Chatbot
 * Identifies query intent and routes to appropriate context
 */

export type QueryIntent =
  | 'attendance'
  | 'marks'
  | 'library'
  | 'fees'
  | 'hostel'
  | 'admission'
  | 'helpdesk'
  | 'general';

interface IntentResult {
  intent: QueryIntent;
  confidence: number;
  keywords: string[];
}

/**
 * Classify query intent based on keywords
 */
export function classifyIntent(query: string): IntentResult {
  const lowerQuery = query.toLowerCase();
  
  // Attendance intent
  if (
    lowerQuery.includes('attendance') ||
    lowerQuery.includes('absent') ||
    lowerQuery.includes('present') ||
    lowerQuery.includes('leaves')
  ) {
    return {
      intent: 'attendance',
      confidence: 0.9,
      keywords: ['attendance', 'absent', 'present'],
    };
  }
  
  // Marks intent
  if (
    lowerQuery.includes('marks') ||
    lowerQuery.includes('score') ||
    lowerQuery.includes('grades') ||
    lowerQuery.includes('exam') ||
    lowerQuery.includes('mid') ||
    lowerQuery.includes('semester')
  ) {
    return {
      intent: 'marks',
      confidence: 0.9,
      keywords: ['marks', 'exam', 'score'],
    };
  }
  
  // Library intent
  if (
    lowerQuery.includes('book') ||
    lowerQuery.includes('library') ||
    lowerQuery.includes('issued') ||
    lowerQuery.includes('borrow') ||
    lowerQuery.includes('overdue')
  ) {
    return {
      intent: 'library',
      confidence: 0.9,
      keywords: ['book', 'library', 'issued'],
    };
  }
  
  // Fees intent
  if (
    lowerQuery.includes('fee') ||
    lowerQuery.includes('payment') ||
    lowerQuery.includes('pending') ||
    lowerQuery.includes('paid') ||
    lowerQuery.includes('amount') ||
    lowerQuery.includes('due')
  ) {
    return {
      intent: 'fees',
      confidence: 0.9,
      keywords: ['fee', 'payment', 'pending'],
    };
  }
  
  // Hostel intent
  if (
    lowerQuery.includes('hostel') ||
    lowerQuery.includes('room') ||
    lowerQuery.includes('accommodation')
  ) {
    return {
      intent: 'hostel',
      confidence: 0.9,
      keywords: ['hostel', 'room'],
    };
  }
  
  // Admission intent
  if (
    lowerQuery.includes('admission') ||
    lowerQuery.includes('application') ||
    lowerQuery.includes('enroll') ||
    lowerQuery.includes('verification')
  ) {
    return {
      intent: 'admission',
      confidence: 0.9,
      keywords: ['admission', 'application'],
    };
  }
  
  // Helpdesk intent
  if (
    lowerQuery.includes('how to') ||
    lowerQuery.includes('help') ||
    lowerQuery.includes('process') ||
    lowerQuery.includes('document') ||
    lowerQuery.includes('tc')
  ) {
    return {
      intent: 'helpdesk',
      confidence: 0.8,
      keywords: ['help', 'process'],
    };
  }
  
  // Default to general
  return {
    intent: 'general',
    confidence: 0.5,
    keywords: [],
  };
}

/**
 * Get helpful suggestions based on intent
 */
export function getSuggestionsForIntent(intent: QueryIntent, role: string): string[] {
  const suggestions: Record<QueryIntent, Record<string, string[]>> = {
    attendance: {
      student: [
        'Show my attendance percentage',
        'When was I last absent?',
        'How many classes did I attend this month?',
      ],
      faculty: [
        'List absent students today',
        'Show attendance for my class',
        'Which students have low attendance?',
      ],
      default: ['Check attendance records', 'View attendance summary'],
    },
    marks: {
      student: [
        'What are my Mid-1 marks?',
        'Show my semester results',
        'What is my current CGPA?',
      ],
      faculty: [
        'Show marks I uploaded',
        'List students who failed Mid-1',
        'What is the class average?',
      ],
      default: ['Check marks', 'View assessment results'],
    },
    library: {
      student: [
        'Which books do I have?',
        'When should I return my books?',
        'Is [book name] available?',
      ],
      librarian: [
        'Show overdue books',
        'List pending return requests',
        'Check book availability',
      ],
      default: ['View library records', 'Check book status'],
    },
    fees: {
      student: [
        'What is my fee status?',
        'How much do I owe?',
        'Show my payment history',
      ],
      accountant: [
        'Show pending fees',
        'Daily collection summary',
        'Branch-wise fee status',
      ],
      default: ['Check fee status', 'View payment records'],
    },
    hostel: {
      student: [
        'Which room am I in?',
        'Show my hostel details',
        'Who is my roommate?',
      ],
      default: ['View hostel information'],
    },
    admission: {
      admission: [
        'How many applications today?',
        'Show pending verifications',
        'Branch-wise admission count',
      ],
      default: ['Check admission status'],
    },
    helpdesk: {
      student: [
        'How do I apply for TC?',
        'What documents are needed?',
        'How to check my marks?',
      ],
      default: ['Get help with processes', 'View FAQs'],
    },
    general: {
      default: ['Ask me anything about your ERP data'],
    },
  };
  
  return suggestions[intent]?.[role] || suggestions[intent]?.default || [];
}

/**
 * Build optimized prompt based on intent
 */
export function buildPromptForIntent(
  intent: QueryIntent,
  query: string,
  context: string
): string {
  const basePrompt = `${context}\n\nUser Question: ${query}\n\n`;
  
  const intentInstructions: Record<QueryIntent, string> = {
    attendance: `Focus on attendance data. Provide:
- Percentage calculations
- Present/Absent counts
- Date-wise breakdown if requested
- Trends or patterns`,
    
    marks: `Focus on marks/grades data. Provide:
- Assessment-wise scores
- Pass/Fail status
- Class averages if relevant
- Performance trends`,
    
    library: `Focus on library records. Provide:
- Book titles and authors
- Issue and return dates
- Overdue status
- Availability information`,
    
    fees: `Focus on fee/payment data. Provide:
- Total amount and pending amount
- Payment history
- Due dates
- Branch/category breakdown`,
    
    hostel: `Focus on hostel accommodation. Provide:
- Room number and type
- Roommate information
- Allocation dates
- Hostel name`,
    
    admission: `Focus on admission data. Provide:
- Application counts
- Status summaries
- Branch-wise statistics
- Verification status`,
    
    helpdesk: `Provide helpful guidance. Include:
- Step-by-step process
- Required documents
- Contact information
- Timeline expectations`,
    
    general: `Provide a helpful response based on available data.`,
  };
  
  return basePrompt + intentInstructions[intent];
}
