/**
 * Test script for Gemini API
 * Run with: npx tsx scripts/testGeminiAPI.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import { generateResponse, isGeminiConfigured } from '../src/lib/ai/gemini';

async function test() {
  console.log('Testing Gemini API...\n');
  
  // Check configuration
  console.log('1. Checking configuration:');
  const configured = isGeminiConfigured();
  console.log('   Gemini configured:', configured);
  console.log('   API Key present:', !!process.env.GEMINI_API_KEY);
  console.log('   API Key length:', process.env.GEMINI_API_KEY?.length || 0);
  console.log('');
  
  if (!configured) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    process.exit(1);
  }
  
  try {
    // Test simple generation
    console.log('2. Testing simple generation:');
    const context = 'You are a helpful AI assistant for an educational ERP system.';
    const prompt = 'Hello, who are you?';
    
    console.log('   Sending test message...');
    const response = await generateResponse(prompt, context);
    
    console.log('   Response received:');
    console.log('   ', response.substring(0, 100) + (response.length > 100 ? '...' : ''));
    console.log('');
    
    console.log('✅ Gemini API is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing Gemini API:', error);
    console.error('\nDetails:');
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

test();
