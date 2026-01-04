import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Call Grok (xAI) with a given system prompt and user query
 * @param {string} systemPrompt - The system prompt defining Grok's role
 * @param {string} userMessage - The user's query or context
 * @returns {Promise<string>} - Grok's response
 */
export async function callGrok(systemPrompt, userMessage) {
  try {
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        model: 'grok-beta', // or 'grok-1' depending on availability
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Grok API Error:', error.response?.data || error.message);
    throw new Error(`Grok failed: ${error.message}`);
  }
}