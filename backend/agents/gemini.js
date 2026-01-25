import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Call Gemini with retry logic and delays
 * @param {string} systemPrompt - The system prompt defining Gemini's role
 * @param {string} userMessage - The user's query or context
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<string>} - Gemini's response
 */
export async function callGemini(systemPrompt, userMessage, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent(userMessage);
      const response = await result.response;
      return response.text();
      
    } catch (error) {
      console.error(`Gemini attempt ${attempt}/${retries} failed:`, error.message);
      
      if (attempt === retries) {
        throw new Error(`Gemini failed after ${retries} attempts: ${error.message}`);
      }
      
      // Wait before retrying (exponential backoff: 2s, 4s, 8s)
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Retrying in ${delay/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}