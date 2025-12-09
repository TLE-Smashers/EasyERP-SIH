import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getContextForUser, formatContextForAI } from '@/lib/ai/contextProvider';
import { generateResponse, isGeminiConfigured } from '@/lib/ai/gemini';
import { classifyIntent, buildPromptForIntent } from '@/lib/ai/intentClassifier';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if Gemini is configured
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'AI chatbot is not configured. Please contact administrator.' 
        },
        { status: 503 }
      );
    }
    
    // Parse request body
    const body: ChatRequest = await request.json();
    const { message, conversationHistory } = body;
    
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Get user context
    const userId = session.user.email;
    const userName = session.user.name || 'User';
    const userRole = session.user.role;
    
    // Fetch relevant context from Google Sheets
    const contextData = await getContextForUser(userRole, userId, userName);
    const formattedContext = formatContextForAI(contextData);
    
    // Classify intent
    const intentResult = classifyIntent(message);
    
    // Build optimized prompt
    const prompt = buildPromptForIntent(intentResult.intent, message, formattedContext);
    
    // Convert conversation history to Gemini format
    // Ensure first message is always 'user' role for Gemini API
    // Temporarily disabled to test basic functionality
    let geminiHistory = undefined;
    
    // Only use conversation history if there are user messages (not the initial assistant greeting)
    if (conversationHistory && conversationHistory.length > 1) {
      const filteredHistory = conversationHistory
        .filter(msg => msg.role === 'user' || (msg.role === 'assistant' && msg.content !== "Hello! I'm your ERP AI assistant. How can I help you today?"))
        .slice(-5)
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
          parts: msg.content,
        }));
      
      // Ensure first message is 'user' role
      if (filteredHistory.length > 0 && filteredHistory[0].role === 'user') {
        geminiHistory = filteredHistory;
      }
    }
    
    console.log('Generating response with history:', geminiHistory ? `${geminiHistory.length} messages` : 'no history');
    
    // Generate AI response
    const aiResponse = await generateResponse(
      message,
      prompt,
      geminiHistory
    );
    
    return NextResponse.json({
      success: true,
      data: {
        message: aiResponse,
        intent: intentResult.intent,
        timestamp: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process chat request',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined,
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  const configured = isGeminiConfigured();
  
  return NextResponse.json({
    success: true,
    data: {
      status: configured ? 'ready' : 'not configured',
      message: configured 
        ? 'AI Chatbot is ready' 
        : 'GEMINI_API_KEY not configured',
    },
  });
}
