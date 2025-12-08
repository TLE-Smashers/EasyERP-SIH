import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { google } from 'googleapis';

async function checkStudents() {
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = process.env.GOOGLE_SHEETS_ID;

    console.log('📊 Fetching Student sheet data...\n');

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Student!A1:P100',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
        console.log('❌ No data found in Student sheet');
        return;
    }

    console.log('📋 Column Headers:');
    console.log(rows[0].join(' | '));
    console.log('═'.repeat(100), '\n');

    const students = rows.slice(1);
    console.log(`Total students in sheet: ${students.length}\n`);

    // Check for graduated students (admission year 2021 or earlier)
    const graduatedStudents = students.filter(row => {
        const admissionYear = parseInt(row[10]); // Column K (admissionYear)
        return admissionYear && admissionYear <= 2021;
    });

    console.log('🎓 GRADUATED STUDENTS (Alumni) - Admission Year 2021 or earlier:\n');
    console.log('═'.repeat(100), '\n');

    if (graduatedStudents.length === 0) {
        console.log('❌ No graduated students found in the sheet.');
        console.log('\n💡 To access alumni dashboard, students need:');
        console.log('   - admissionYear (Column K) of 2021 or earlier');
        console.log('   - Current year is 2025, so 2021 batch would have graduated in June 2025\n');
    } else {
        console.log(`Found ${graduatedStudents.length} graduated students (alumni):\n`);

        graduatedStudents.forEach((row, index) => {
            console.log(`Alumni #${index + 1}:`);
            console.log(`  👤 Name:           ${row[2] || 'N/A'}`);
            console.log(`  📧 Email:          ${row[5] || 'N/A'}`);
            console.log(`  🔑 Password:       ${row[6] || 'N/A'} (mobile number)`);
            console.log(`  📅 Admission Year: ${row[10] || 'N/A'}`);
            console.log(`  🎓 Course:         ${row[8] || 'N/A'} - ${row[9] || 'N/A'}`);
            console.log(`  📱 Mobile:         ${row[6] || 'N/A'}`);
            console.log(`  🆔 ID:             ${row[0] || 'N/A'}`);
            console.log(`  📝 Enrollment:     ${row[1] || 'N/A'}`);
            console.log();
        });

        console.log('═'.repeat(100), '\n');
        console.log('✅ USE THESE CREDENTIALS TO LOGIN TO ALUMNI DASHBOARD:');
        console.log('   Email: (any email from above)');
        console.log('   Password: (corresponding mobile number)\n');
    }

    console.log('═'.repeat(100), '\n');
    console.log('📝 FIRST 10 STUDENTS IN SHEET (All Students):\n');

    students.slice(0, 10).forEach((row, index) => {
        const admissionYear = parseInt(row[10]);
        const isAlumni = admissionYear && admissionYear <= 2021;

        console.log(`Student #${index + 1}:`);
        console.log(`  Name:           ${row[2] || 'N/A'}`);
        console.log(`  Email:          ${row[5] || 'N/A'}`);
        console.log(`  Mobile:         ${row[6] || 'N/A'}`);
        console.log(`  Admission Year: ${row[10] || 'N/A'}`);
        console.log(`  Course:         ${row[8] || 'N/A'} - ${row[9] || 'N/A'}`);
        console.log(`  Status:         ${isAlumni ? '🎓 ALUMNI (will redirect to alumni dashboard)' : '👨‍🎓 Active Student'}`);
        console.log();
    });

    if (students.length > 10) {
        console.log(`... and ${students.length - 10} more students\n`);
    }

    console.log('═'.repeat(100), '\n');
    console.log('💡 IMPORTANT NOTES:');
    console.log('   1. Students login with: email + mobile number as password');
    console.log('   2. Alumni = students with admissionYear 2021 or earlier');
    console.log('   3. Alumni are automatically redirected to /dashboard/alumni');
    console.log('   4. Active students go to /dashboard/student\n');
}

checkStudents().catch(console.error);
