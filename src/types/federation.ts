/**
 * Federation Types - Multi-Institution Resource Sharing
 * Defines types for cross-institution collaboration
 */

/**
 * Institution Information
 */
export interface Institution {
  institutionId: string;
  institutionName: string;
  institutionCode: string; // Short code (e.g., "INST001")
  location: string;
  city: string;
  state: string;
  type: InstitutionType;
  sheetId: string; // Google Sheet ID for this institution
  contactEmail: string;
  contactPerson: string;
  phoneNumber: string;
  website?: string;
  status: InstitutionStatus;
  joinedDate: string;
  lastSyncDate?: string;
  partnerInstitutions: string[]; // Array of institution IDs
  rowNumber?: number;
}

export enum InstitutionType {
  GOVERNMENT = 'government',
  PRIVATE = 'private',
  DEEMED = 'deemed',
  AUTONOMOUS = 'autonomous',
}

export enum InstitutionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

/**
 * Shared Ebook Resource
 */
export interface SharedEbook {
  ebookId: string;
  title: string;
  author: string;
  isbn?: string;
  publishedYear: string;
  category: EbookCategory;
  subject: string;
  description?: string;
  fileUrl: string; // Google Drive link
  fileSize?: string;
  fileType: 'pdf' | 'epub' | 'mobi' | 'other';
  coverImageUrl?: string;
  uploadedBy: string; // Faculty email
  uploadedByName: string;
  institutionId: string;
  institutionName: string;
  availableFor: string[]; // Array of institution IDs or ['all']
  accessType: AccessType;
  downloads: number;
  rating?: number;
  addedDate: string;
  lastUpdated?: string;
  tags?: string[];
  language: string;
  pageCount?: number;
  isActive: boolean;
  rowNumber?: number;
}

export enum EbookCategory {
  TEXTBOOK = 'textbook',
  REFERENCE = 'reference',
  RESEARCH = 'research',
  JOURNAL = 'journal',
  MAGAZINE = 'magazine',
  GENERAL = 'general',
}

/**
 * Shared Faculty Notes
 */
export interface SharedNote {
  noteId: string;
  title: string;
  subject: string;
  topic: string;
  course: string;
  semester: string;
  branch?: string;
  description?: string;
  fileUrl: string; // Google Drive link
  fileType: 'pdf' | 'ppt' | 'doc' | 'other';
  fileSize?: string;
  facultyId: string;
  facultyName: string;
  facultyEmail: string;
  institutionId: string;
  institutionName: string;
  availableFor: string[]; // Array of institution IDs or ['all']
  accessType: AccessType;
  downloads: number;
  views: number;
  rating?: number;
  uploadDate: string;
  lastUpdated?: string;
  tags?: string[];
  academicYear?: string;
  isActive: boolean;
  rowNumber?: number;
}

export enum AccessType {
  PUBLIC = 'public',           // Available to all partner institutions
  PARTNER = 'partner',         // Available to selected partners only
  RECIPROCAL = 'reciprocal',   // Only if they share resources back
  RESTRICTED = 'restricted',   // Requires approval for each access
}

/**
 * Resource Access Log
 */
export interface ResourceAccessLog {
  logId: string;
  resourceType: 'ebook' | 'note';
  resourceId: string;
  resourceTitle: string;
  requestedBy: string; // User email
  requestedByName: string;
  userRole: string; // student, faculty, etc.
  requestingInstitutionId: string;
  requestingInstitutionName: string;
  ownerInstitutionId: string;
  ownerInstitutionName: string;
  accessDate: string;
  action: 'view' | 'download' | 'request';
  status: 'success' | 'denied' | 'pending';
  ipAddress?: string;
  deviceInfo?: string;
  rowNumber?: number;
}

/**
 * Cross-Institution Search Index
 */
export interface SearchIndex {
  indexId: string;
  resourceId: string;
  resourceType: 'ebook' | 'note';
  title: string;
  keywords: string; // Comma-separated keywords
  author?: string;
  category: string;
  subject: string;
  institutionId: string;
  institutionName: string;
  availability: 'available' | 'restricted' | 'unavailable';
  accessType: AccessType;
  addedDate: string;
  downloads: number;
  rating?: number;
  rowNumber?: number;
}

/**
 * Sharing Request (for restricted resources)
 */
export interface SharingRequest {
  requestId: string;
  resourceType: 'ebook' | 'note';
  resourceId: string;
  resourceTitle: string;
  requestedBy: string;
  requestedByName: string;
  requestedByRole: string;
  requestingInstitutionId: string;
  requestingInstitutionName: string;
  ownerInstitutionId: string;
  ownerInstitutionName: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  expiryDate?: string; // For time-limited access
  rowNumber?: number;
}

/**
 * Partnership Agreement
 */
export interface Partnership {
  partnershipId: string;
  institution1Id: string;
  institution1Name: string;
  institution2Id: string;
  institution2Name: string;
  partnershipType: 'bilateral' | 'reciprocal' | 'one-way';
  startDate: string;
  endDate?: string;
  status: 'active' | 'expired' | 'suspended';
  resourcesSharingEnabled: boolean;
  notesEnabled: boolean;
  ebooksEnabled: boolean;
  createdBy: string;
  createdDate: string;
  rowNumber?: number;
}

/**
 * Federation Statistics
 */
export interface FederationStats {
  totalInstitutions: number;
  activeInstitutions: number;
  totalSharedEbooks: number;
  totalSharedNotes: number;
  totalDownloads: number;
  totalViews: number;
  recentActivity: ResourceAccessLog[];
  topSharedResources: Array<{
    resourceId: string;
    title: string;
    type: 'ebook' | 'note';
    downloads: number;
  }>;
}

/**
 * Sync Status
 */
export interface SyncStatus {
  institutionId: string;
  lastSyncDate: string;
  syncStatus: 'success' | 'failed' | 'in-progress';
  syncedResources: number;
  failedResources: number;
  errorMessage?: string;
}

/**
 * Filter Options for Shared Resources
 */
export interface SharedResourceFilter {
  institutionId?: string;
  category?: string;
  subject?: string;
  accessType?: AccessType;
  searchQuery?: string;
  minRating?: number;
  dateFrom?: string;
  dateTo?: string;
  language?: string;
}

/**
 * Share Resource Request Data
 */
export interface ShareResourceData {
  resourceType: 'ebook' | 'note';
  resourceId: string;
  shareWith: string[]; // Array of institution IDs or ['all']
  accessType: AccessType;
  expiryDate?: string; // Optional expiry for sharing
  sharedBy: string;
}

/**
 * Update data types for partial updates
 */
export type InstitutionUpdateData = Partial<Omit<Institution, 'institutionId' | 'rowNumber'>>;
export type SharedEbookUpdateData = Partial<Omit<SharedEbook, 'ebookId' | 'rowNumber'>>;
export type SharedNoteUpdateData = Partial<Omit<SharedNote, 'noteId' | 'rowNumber'>>;
