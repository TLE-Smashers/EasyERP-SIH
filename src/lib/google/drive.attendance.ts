/**
 * Google Drive Integration for Attendance Photos
 * Upload and manage faculty attendance selfies
 */

import { google } from 'googleapis';

const FOLDER_NAME = 'Faculty_Attendance_Photos';

/**
 * Get authenticated Google Drive client
 */
async function getDriveClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.appdata',
    ],
  });

  const drive = google.drive({ version: 'v3', auth });
  return drive;
}

/**
 * Get or create the attendance photos folder
 */
async function getOrCreateFolder(drive: any): Promise<string> {
  // Check if folder ID is stored in env
  if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
    return process.env.GOOGLE_DRIVE_FOLDER_ID;
  }

  // Search for existing folder
  const searchResponse = await drive.files.list({
    q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (searchResponse.data.files && searchResponse.data.files.length > 0) {
    const folderId = searchResponse.data.files[0].id;
    console.log(`[Drive] Using existing folder: ${folderId}`);
    return folderId!;
  }

  // Create new folder
  const folderMetadata = {
    name: FOLDER_NAME,
    mimeType: 'application/vnd.google-apps.folder',
  };

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id',
  });

  const folderId = folder.data.id!;
  console.log(`[Drive] Created new folder: ${folderId}`);
  console.log(`[Drive] Add this to .env.local: GOOGLE_DRIVE_FOLDER_ID=${folderId}`);

  return folderId;
}

/**
 * Upload photo to Google Drive
 * @param base64Photo - Base64 encoded image
 * @param fileName - File name (e.g., "faculty123_checkin_20251209.jpg")
 * @returns Shareable URL of uploaded photo
 */
export async function uploadPhotoToDrive(
  base64Photo: string,
  fileName: string
): Promise<{ success: boolean; url?: string; fileId?: string; error?: string }> {
  try {
    console.log(`[Drive] Uploading photo: ${fileName}`);
    
    const drive = await getDriveClient();
    const folderId = await getOrCreateFolder(drive);

    // Convert base64 to buffer
    const base64Data = base64Photo.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Create file metadata
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    // Upload file
    const media = {
      mimeType: 'image/jpeg',
      body: require('stream').Readable.from(buffer),
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });

    const fileId = file.data.id!;

    // Make file publicly accessible (readable by anyone with link)
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Get shareable link
    const fileInfo = await drive.files.get({
      fileId: fileId,
      fields: 'webViewLink, webContentLink',
    });

    const url = fileInfo.data.webContentLink || fileInfo.data.webViewLink || '';

    console.log(`[Drive] Upload successful: ${url}`);

    return {
      success: true,
      url,
      fileId,
    };
  } catch (error: any) {
    console.error('[Drive] Upload failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload photo to Google Drive',
    };
  }
}

/**
 * Delete photo from Google Drive
 */
export async function deletePhotoFromDrive(fileId: string): Promise<boolean> {
  try {
    const drive = await getDriveClient();
    await drive.files.delete({ fileId });
    console.log(`[Drive] Deleted file: ${fileId}`);
    return true;
  } catch (error) {
    console.error('[Drive] Delete failed:', error);
    return false;
  }
}

/**
 * Generate file name for attendance photo
 */
export function generatePhotoFileName(
  facultyId: string,
  type: 'checkin' | 'checkout',
  date: Date = new Date()
): string {
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '');
  return `${facultyId}_${type}_${dateStr}_${timeStr}.jpg`;
}

/**
 * Get direct image URL from Google Drive file ID
 */
export function getDriveImageUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

/**
 * List all photos in attendance folder (for cleanup/admin)
 */
export async function listAttendancePhotos(limit: number = 100): Promise<any[]> {
  try {
    const drive = await getDriveClient();
    const folderId = await getOrCreateFolder(drive);

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, createdTime, size, webViewLink)',
      pageSize: limit,
      orderBy: 'createdTime desc',
    });

    return response.data.files || [];
  } catch (error) {
    console.error('[Drive] List failed:', error);
    return [];
  }
}

/**
 * Clean up old photos (older than X days)
 */
export async function cleanupOldPhotos(daysToKeep: number = 90): Promise<number> {
  try {
    const drive = await getDriveClient();
    const photos = await listAttendancePhotos(1000);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    let deletedCount = 0;

    for (const photo of photos) {
      const createdDate = new Date(photo.createdTime);
      if (createdDate < cutoffDate) {
        await drive.files.delete({ fileId: photo.id });
        deletedCount++;
      }
    }

    console.log(`[Drive] Cleaned up ${deletedCount} old photos`);
    return deletedCount;
  } catch (error) {
    console.error('[Drive] Cleanup failed:', error);
    return 0;
  }
}
