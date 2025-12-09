/**
 * Test script for chatbot context provider
 * Run with: npx tsx scripts/testChatbotContext.ts
 */

import { getContextForUser } from '../src/lib/ai/contextProvider';

async function test() {
  console.log('Testing Chatbot Context Provider...\n');
  
  try {
    // Test student context
    console.log('1. Testing Student Context:');
    const studentContext = await getContextForUser(
      'student',
      'student@test.com',
      'Test Student'
    );
    console.log('   Role:', studentContext.role);
    console.log('   User:', studentContext.userName);
    console.log('   Summary:', studentContext.summary.substring(0, 100) + '...');
    console.log('   Data keys:', Object.keys(studentContext.data));
    console.log('');
    
    // Test faculty context
    console.log('2. Testing Faculty Context:');
    const facultyContext = await getContextForUser(
      'faculty',
      'faculty@test.com',
      'Test Faculty'
    );
    console.log('   Role:', facultyContext.role);
    console.log('   User:', facultyContext.userName);
    console.log('   Summary:', facultyContext.summary.substring(0, 100) + '...');
    console.log('   Data keys:', Object.keys(facultyContext.data));
    console.log('');
    
    console.log('✅ Context provider is working correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

test();
