import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const CONFIG_SHEET = process.env.GOOGLE_CONFIG_SHEET || 'Config';
const QR_KEY = 'admissionFormQrLink';

async function getAuth() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentials) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not set');
  return new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function getQrLinkFromSheet() {
  if (!SPREADSHEET_ID) throw new Error('GOOGLE_SHEETS_ID not set');
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth: auth as any });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${CONFIG_SHEET}!A:B`,
  });
  const rows = res.data.values || [];
  const found = rows.find(row => row[0] === QR_KEY);
  return found ? found[1] : null;
}

async function setQrLinkInSheet(link: string) {
  if (!SPREADSHEET_ID) throw new Error('GOOGLE_SHEETS_ID not set');
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth: auth as any });
  // Try to find the row first
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${CONFIG_SHEET}!A:B`,
  });
  const rows = res.data.values || [];
  const rowIndex = rows.findIndex(row => row[0] === QR_KEY);
  if (rowIndex !== -1) {
    // Update existing
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CONFIG_SHEET}!B${rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[link]] },
    });
  } else {
    // Append new
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CONFIG_SHEET}!A:B`,
      valueInputOption: 'RAW',
      requestBody: { values: [[QR_KEY, link]] },
    });
  }
}

export async function GET() {
  try {
    const qrLink = await getQrLinkFromSheet();
    return NextResponse.json({ qrLink });
  } catch (error: any) {
    return NextResponse.json({ qrLink: null, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { qrLink: newQrLink } = await req.json();
    await setQrLinkInSheet(newQrLink);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
