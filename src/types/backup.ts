/**
 * Backup System Types
 * Simple types for prototype phase
 */

export type BackupStatus = 'pending' | 'completed' | 'failed';

export interface Backup {
  id: string;
  name: string;
  type: string;
  status: BackupStatus;
  createdAt: string;
  size?: string;
  downloadUrl?: string;
}
