export type UserRole = 'super-admin' | 'admin' | 'admission' | 'accountant' | 'warden' | 'librarian' | 'student' | 'faculty' | 'hostel';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  status: 'active' | 'inactive';
  institutionId?: string; // For tracking which institution the user belongs to
}

export interface AuthUser extends User {
  password?: string; // Only used for credentials provider
}

// Super Admin specific types
export interface Institution {
  id: string;
  name: string;
  code: string;
  type: 'university' | 'college' | 'school';
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  contactEmail: string;
  contactPhone: string;
  principalName?: string;
  spreadsheetId: string; // Google Sheet ID for this institution
  status: 'active' | 'inactive' | 'suspended';
  registeredDate: string;
  lastActive?: string;
  adminCount?: number;
  studentCount?: number;
  facultyCount?: number;
}

export interface SharedResource {
  id: string;
  title: string;
  description: string;
  type: 'ebook' | 'video' | 'document' | 'course' | 'template';
  category: string;
  url: string;
  sheetUrl?: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedDate: string;
  accessCount?: number;
  tags?: string[];
  status: 'active' | 'archived';
}