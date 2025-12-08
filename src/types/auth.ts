export type UserRole = 'admin' | 'admission' | 'accountant' | 'warden' | 'librarian' | 'student' | 'faculty' | 'hostel';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  status: 'active' | 'inactive';
}

export interface AuthUser extends User {
  password?: string; // Only used for credentials provider
}