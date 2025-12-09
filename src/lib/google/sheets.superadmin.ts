import { google } from 'googleapis';
import { Institution, SharedResource } from '@/types/auth';

/**
 * Super Admin Google Sheets Management
 * Handles institutions and shared resources management
 */

// Using the Federation Master sheet for Super Admin
const SUPER_ADMIN_SPREADSHEET_ID = process.env.SUPER_MASTER_SHEET_ID;
const INSTITUTIONS_SHEET_NAME = 'Institutions';
const SHARED_EBOOKS_SHEET_NAME = 'Shared_Ebooks';
const LIBRARY_RESOURCES_SHEET_NAME = 'LibraryResources';
const SHARED_NOTES_SHEET_NAME = 'Shared_Notes';

// Initialize Google Sheets API client
const getGoogleSheetsClient = async () => {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  
  if (!credentials) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth: await auth.getClient() as any });
};

/**
 * Fetch all institutions from the Super Admin sheet
 */
export async function getAllInstitutions(): Promise<Institution[]> {
  try {
    if (!SUPER_ADMIN_SPREADSHEET_ID) {
      throw new Error('SUPER_MASTER_SHEET_ID is not configured');
    }

    const sheets = await getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SUPER_ADMIN_SPREADSHEET_ID,
      range: `${INSTITUTIONS_SHEET_NAME}!A:O`,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return [];
    }

    // Skip header row
    const institutions: Institution[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      institutions.push({
        id: row[0] || '',
        name: row[1] || '',
        code: row[2] || '',
        type: (row[3] as 'university' | 'college' | 'school') || 'college',
        address: row[4] || '',
        city: row[5] || '',
        state: row[6] || '',
        country: row[7] || '',
        pincode: row[8] || '',
        contactEmail: row[9] || '',
        contactPhone: row[10] || '',
        principalName: row[11] || '',
        spreadsheetId: row[12] || '',
        status: (row[13] as 'active' | 'inactive' | 'suspended') || 'active',
        registeredDate: row[14] || new Date().toISOString(),
        lastActive: row[15] || '',
        adminCount: parseInt(row[16]) || 0,
        studentCount: parseInt(row[17]) || 0,
        facultyCount: parseInt(row[18]) || 0,
      });
    }

    return institutions;
  } catch (error) {
    console.error('Error fetching institutions:', error);
    throw error;
  }
}

/**
 * Fetch a specific institution by ID
 */
export async function getInstitutionById(institutionId: string): Promise<Institution | null> {
  try {
    const institutions = await getAllInstitutions();
    return institutions.find(inst => inst.id === institutionId) || null;
  } catch (error) {
    console.error('Error fetching institution:', error);
    return null;
  }
}

/**
 * Add a new institution
 */
export async function addInstitution(institution: Omit<Institution, 'id' | 'registeredDate'>): Promise<boolean> {
  try {
    if (!SUPER_ADMIN_SPREADSHEET_ID) {
      throw new Error('SUPER_MASTER_SHEET_ID is not configured');
    }

    const sheets = await getGoogleSheetsClient();
    const newId = `INST-${Date.now()}`;
    const registeredDate = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId: SUPER_ADMIN_SPREADSHEET_ID,
      range: `${INSTITUTIONS_SHEET_NAME}!A:O`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          newId,
          institution.name,
          institution.code,
          institution.type,
          institution.address,
          institution.city,
          institution.state,
          institution.country,
          institution.pincode,
          institution.contactEmail,
          institution.contactPhone,
          institution.principalName || '',
          institution.spreadsheetId,
          institution.status,
          registeredDate,
          institution.lastActive || '',
          institution.adminCount || 0,
          institution.studentCount || 0,
          institution.facultyCount || 0,
        ]],
      },
    });

    return true;
  } catch (error) {
    console.error('Error adding institution:', error);
    return false;
  }
}

/**
 * Update institution status
 */
export async function updateInstitutionStatus(
  institutionId: string, 
  status: 'active' | 'inactive' | 'suspended'
): Promise<boolean> {
  try {
    if (!SUPER_ADMIN_SPREADSHEET_ID) {
      throw new Error('SUPER_MASTER_SHEET_ID is not configured');
    }

    const sheets = await getGoogleSheetsClient();
    const institutions = await getAllInstitutions();
    const index = institutions.findIndex(inst => inst.id === institutionId);

    if (index === -1) {
      return false;
    }

    // Row index in sheet (adding 2: 1 for header, 1 for 0-based to 1-based)
    const rowIndex = index + 2;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SUPER_ADMIN_SPREADSHEET_ID,
      range: `${INSTITUTIONS_SHEET_NAME}!N${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[status]],
      },
    });

    return true;
  } catch (error) {
    console.error('Error updating institution status:', error);
    return false;
  }
}

/**
 * Fetch all shared resources from Federation Master sheet
 * Combines data from Shared_Ebooks, LibraryResources, and Shared_Notes
 */
export async function getAllSharedResources(): Promise<SharedResource[]> {
  try {
    if (!SUPER_ADMIN_SPREADSHEET_ID) {
      throw new Error('Federation sheet is not configured');
    }

    const sheets = await getGoogleSheetsClient();
    const resources: SharedResource[] = [];

    // Fetch Shared E-books
    try {
      const ebooksResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SUPER_ADMIN_SPREADSHEET_ID,
        range: `${SHARED_EBOOKS_SHEET_NAME}!A:Z`,
      });

      const ebookRows = ebooksResponse.data.values;
      if (ebookRows && ebookRows.length > 1) {
        for (let i = 1; i < ebookRows.length; i++) {
          const row = ebookRows[i];
          if (row[25] === 'true' || row[25] === '1' || row[25] === 'TRUE') { // isActive check
            resources.push({
              id: row[0] || '',
              title: row[1] || '',
              description: row[7] || '',
              type: 'ebook',
              category: row[5] || row[6] || '', // category or subject
              url: row[8] || '',
              sheetUrl: '',
              thumbnailUrl: row[11] || '',
              uploadedBy: row[13] || '',
              uploadedDate: row[20] || '',
              accessCount: parseInt(row[18]) || 0,
              tags: row[22] ? row[22].split(',').map((t: string) => t.trim()) : [],
              status: 'active',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching ebooks:', error);
    }

    // Fetch Library Resources
    try {
      const resourcesResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SUPER_ADMIN_SPREADSHEET_ID,
        range: `${LIBRARY_RESOURCES_SHEET_NAME}!A:Q`,
      });

      const resourceRows = resourcesResponse.data.values;
      if (resourceRows && resourceRows.length > 1) {
        for (let i = 1; i < resourceRows.length; i++) {
          const row = resourceRows[i];
          if (row[16] === 'active' || row[16] === 'Active') { // status check
            resources.push({
              id: row[0] || '',
              title: row[2] || '',
              description: row[5] || '',
              type: (row[1] as 'ebook' | 'video' | 'document' | 'course' | 'template') || 'document',
              category: row[4] || '',
              url: row[6] || '',
              sheetUrl: '',
              thumbnailUrl: '',
              uploadedBy: row[11] || '',
              uploadedDate: row[13] || '',
              accessCount: parseInt(row[15]) || 0,
              tags: row[14] ? row[14].split(',').map((t: string) => t.trim()) : [],
              status: 'active',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching library resources:', error);
    }

    // Fetch Shared Notes
    try {
      const notesResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SUPER_ADMIN_SPREADSHEET_ID,
        range: `${SHARED_NOTES_SHEET_NAME}!A:Z`,
      });

      const noteRows = notesResponse.data.values;
      if (noteRows && noteRows.length > 1) {
        for (let i = 1; i < noteRows.length; i++) {
          const row = noteRows[i];
          if (row[25] === 'true' || row[25] === '1' || row[25] === 'TRUE') { // isActive check
            resources.push({
              id: row[0] || '',
              title: row[1] || '',
              description: row[7] || '',
              type: 'document',
              category: row[2] || row[3] || '', // subject or topic
              url: row[8] || '',
              sheetUrl: '',
              thumbnailUrl: '',
              uploadedBy: row[11] || row[12] || '', // facultyId or facultyName
              uploadedDate: row[21] || '',
              accessCount: parseInt(row[18]) || 0,
              tags: row[23] ? row[23].split(',').map((t: string) => t.trim()) : [],
              status: 'active',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching shared notes:', error);
    }

    return resources;
  } catch (error) {
    console.error('Error fetching shared resources:', error);
    return [];
  }
}

/**
 * Add a new shared resource to appropriate sheet
 */
export async function addSharedResource(resource: Omit<SharedResource, 'id' | 'uploadedDate' | 'accessCount'>): Promise<boolean> {
  try {
    if (!SUPER_ADMIN_SPREADSHEET_ID) {
      throw new Error('Federation sheet is not configured');
    }

    const sheets = await getGoogleSheetsClient();
    const newId = `${resource.type.toUpperCase()}-${Date.now()}`;
    const uploadedDate = new Date().toISOString();

    // Route to appropriate sheet based on type
    let sheetName = LIBRARY_RESOURCES_SHEET_NAME;
    let values: any[] = [];

    if (resource.type === 'ebook') {
      sheetName = SHARED_EBOOKS_SHEET_NAME;
      values = [[
        newId, // ebookId
        resource.title, // title
        '', // author
        '', // isbn
        '', // publishedYear
        resource.category, // category
        '', // subject
        resource.description, // description
        resource.url, // fileUrl
        '', // fileSize
        '', // fileType
        resource.thumbnailUrl || '', // coverImageUrl
        resource.uploadedBy, // uploadedBy
        '', // uploadedByName
        '', // institutionId
        'Government of Rajasthan', // institutionName
        'all', // availableFor
        'public', // accessType
        0, // downloads
        0, // rating
        uploadedDate, // addedDate
        uploadedDate, // lastUpdated
        resource.tags?.join(', ') || '', // tags
        '', // language
        '', // pageCount
        'true', // isActive
      ]];
    } else {
      // Add to LibraryResources for other types
      values = [[
        newId, // resourceId
        resource.type, // type
        resource.title, // title
        '', // author
        resource.category, // category
        resource.description, // description
        resource.url, // fileUrl
        '', // fileName
        '', // fileSize
        '', // fileType
        resource.uploadedBy, // uploadedBy
        '', // uploadedByName
        'superadmin', // uploadedByRole
        uploadedDate, // uploadDate
        resource.tags?.join(', ') || '', // tags
        0, // downloadCount
        'active', // status
      ]];
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SUPER_ADMIN_SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return true;
  } catch (error) {
    console.error('Error adding shared resource:', error);
    return false;
  }
}

/**
 * Get Super Admin dashboard statistics
 */
export async function getSuperAdminStats() {
  try {
    const institutions = await getAllInstitutions();
    const resources = await getAllSharedResources();

    const activeInstitutions = institutions.filter(i => i.status === 'active').length;
    const totalAdmins = institutions.reduce((sum, i) => sum + (i.adminCount || 0), 0);
    const totalStudents = institutions.reduce((sum, i) => sum + (i.studentCount || 0), 0);
    const totalFaculty = institutions.reduce((sum, i) => sum + (i.facultyCount || 0), 0);

    return {
      totalInstitutions: institutions.length,
      activeInstitutions,
      suspendedInstitutions: institutions.filter(i => i.status === 'suspended').length,
      totalAdmins,
      totalStudents,
      totalFaculty,
      totalUsers: totalAdmins + totalStudents + totalFaculty,
      totalResources: resources.length,
    };
  } catch (error) {
    console.error('Error fetching super admin stats:', error);
    return null;
  }
}
