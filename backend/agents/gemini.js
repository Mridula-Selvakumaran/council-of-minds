import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Call Gemini with a given system prompt and user query
 * @param {string} systemPrompt - The system prompt defining Gemini's role
 * @param {string} userMessage - The user's query or context
 * @returns {Promise<string>} - Gemini's response
 */
export async function callGemini(systemPrompt, userMessage) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error(`Gemini failed: ${error.message}`);
  }
}