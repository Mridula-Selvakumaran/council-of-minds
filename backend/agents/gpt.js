import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = process.env.GPT_MODEL;

/**
 * Call GPT-4 with a given system prompt and user query
 * @param {string} systemPrompt - The system prompt defining GPT's role
 * @param {string} userMessage - The user's query or context
 * @returns {Promise<string>} - GPT's response
 */
export async function callGPT(systemPrompt, userMessage) {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('GPT API Error:', error.message);
    throw new Error(`GPT failed: ${error.message}`);
  }
}