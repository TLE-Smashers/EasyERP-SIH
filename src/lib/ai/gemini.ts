/**
 * Google Gemini AI Integration
 * Provides AI-powered chat capabilities for ERP system
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Get Gemini model instance
 */
export function getGeminiModel() {
  return genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  });
}

interface ConversationMessage {
  role: 'user' | 'model';
  parts: string;
}

/**
 * Generate AI response with context
 */
export async function generateResponse(
  prompt: string,
  context: string,
  conversationHistory?: ConversationMessage[]
): Promise<string> {
  try {
    console.log('Generating response...');
    console.log('Prompt length:', prompt.length);
    console.log('Context length:', context.length);
    console.log('History:', conversationHistory ? `${conversationHistory.length} messages` : 'none');
    
    const model = getGeminiModel();
    
    // Build the full prompt with context
    const fullPrompt = `${context}\n\nUser Question: ${prompt}\n\nProvide a clear, accurate, and concise response based only on the provided context.`;
    
    console.log('Full prompt length:', fullPrompt.length);
    
    // If we have conversation history, use chat
    if (conversationHistory && conversationHistory.length > 0) {
      console.log('Using chat mode with history');
      const chat = model.startChat({
        history: conversationHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.parts }],
        })),
      });
      
      const result = await chat.sendMessage(fullPrompt);
      const responseText = result.response.text();
      console.log('Response received, length:', responseText.length);
      return responseText;
    }
    
    // Otherwise, use single generation
    console.log('Using single generation mode');
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    console.log('Response received, length:', responseText.length);
    return responseText;
  } catch (error) {
    console.error('Gemini API error:', error);
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && 'response' in error) {
      console.error('API Response:', (error as unknown as { response: unknown }).response);
    }
    throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Stream AI response (for real-time chat)
 */
export async function* streamResponse(
  prompt: string,
  context: string
): AsyncGenerator<string> {
  try {
    const model = getGeminiModel();
    const fullPrompt = `${context}\n\nUser Question: ${prompt}\n\nProvide a clear, accurate, and concise response based only on the provided context.`;
    
    const result = await model.generateContentStream(fullPrompt);
    
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error('Gemini streaming error:', error);
    throw new Error('Failed to stream AI response');
  }
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}
