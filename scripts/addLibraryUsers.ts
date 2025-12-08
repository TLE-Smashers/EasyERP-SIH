/**
 * Add Library Test Users
 * Adds student@test.com and librarian@test.com with password "12345"
 * Run with: npx tsx scripts/addLibraryUsers.ts
 */

import bcrypt from "bcryptjs";

async function addLibraryUsers() {
  console.log("🔐 Adding Library Module Test Users...\n");

  const password = "12345";
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log("📧 User Credentials:");
  console.log("─".repeat(60));
  console.log("\n1. STUDENT ACCOUNT");
  console.log("   Email:    student@test.com");
  console.log("   Password: 12345");
  console.log("   Role:     student");
  console.log("   Name:     Test Student");
  
  console.log("\n2. LIBRARIAN ACCOUNT");
  console.log("   Email:    librarian@test.com");
  console.log("   Password: 12345");
  console.log("   Role:     librarian");
  console.log("   Name:     Test Librarian");
  
  console.log("\n─".repeat(60));
  console.log("\n📋 ADD THESE ROWS TO YOUR GOOGLE SHEET (Users Tab):\n");
  
  console.log("Row for student@test.com:");
  console.log(`student@test.com | ${hashedPassword} | Test Student | student | active\n`);
  
  console.log("Row for librarian@test.com:");
  console.log(`librarian@test.com | ${hashedPassword} | Test Librarian | librarian | active\n`);
  
  console.log("─".repeat(60));
  console.log("\n✅ Copy the rows above and paste them into your Google Sheet");
  console.log("   (Users tab, starting from column A)\n");
  
  console.log("📝 Column Structure:");
  console.log("   A: email");
  console.log("   B: password (hashed)");
  console.log("   C: name");
  console.log("   D: role");
  console.log("   E: status");
  console.log("\n");
}

addLibraryUsers().catch(console.error);
