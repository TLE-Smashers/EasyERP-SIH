/**
 * Google Sheets Integration for Shared Videos
 */

import { google } from 'googleapis';

const SHEET_NAME = 'SharedVideos';
const SUPER_MASTER_SHEET_ID = process.env.SUPER_MASTER_SHEET_ID;

interface Video {
  videoId: string;
  title: string;
  author: string;
  category: string;
  description?: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedByRole: string;
  uploadDate: string;
  tags?: string[];
  viewCount: number;
  status: string;
}

async function getSheetsClient() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentials) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not set');

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

export async function addVideo(video: Omit<Video, 'videoId' | 'viewCount' | 'status'>): Promise<{ success: boolean; videoId?: string; error?: string }> {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = SUPER_MASTER_SHEET_ID || process.env.GOOGLE_SHEETS_ID;
    
    if (!spreadsheetId) {
      return { success: false, error: 'SUPER_MASTER_SHEET_ID not configured' };
    }
    
    const videoId = `VID-${Date.now()}`;
    const row = [
      videoId,
      video.title,
      video.author,
      video.category,
      video.description || '',
      video.fileUrl,
      video.uploadedBy,
      video.uploadedByName,
      video.uploadedByRole,
      video.uploadDate,
      video.tags?.join(',') || '',
      '0', // viewCount
      'active', // status
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:M`,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    });

    return { success: true, videoId };
  } catch (error: any) {
    console.error('Error adding video:', error);
    
    // If sheet doesn't exist, provide helpful error message
    if (error?.message?.includes('Unable to parse range')) {
      return { 
        success: false, 
        error: `Sheet "${SHEET_NAME}" not found. Please create the sheet with headers: videoId, title, author, category, description, fileUrl, uploadedBy, uploadedByName, uploadedByRole, uploadDate, tags, viewCount, status` 
      };
    }
    
    return { success: false, error: error instanceof Error ? error.message : 'Failed to add video' };
  }
}

export async function getVideos(): Promise<Video[]> {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = SUPER_MASTER_SHEET_ID || process.env.GOOGLE_SHEETS_ID;
    
    if (!spreadsheetId) {
      console.error('SUPER_MASTER_SHEET_ID not configured');
      return [];
    }
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A2:M`,
    });

    const rows = response.data.values || [];
    return rows.map((row: any[]) => ({
      videoId: row[0] || '',
      title: row[1] || '',
      author: row[2] || '',
      category: row[3] || '',
      description: row[4] || '',
      fileUrl: row[5] || '',
      uploadedBy: row[6] || '',
      uploadedByName: row[7] || '',
      uploadedByRole: row[8] || '',
      uploadDate: row[9] || '',
      tags: row[10] ? row[10].split(',').map((t: string) => t.trim()) : [],
      viewCount: parseInt(row[11]) || 0,
      status: row[12] || 'active',
    })).filter(v => v.status === 'active');
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
}
