import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Call Claude with a given system prompt and user query
 * @param {string} systemPrompt - The system prompt defining Claude's role
 * @param {string} userMessage - The user's query or context
 * @returns {Promise<string>} - Claude's response
 */
export async function callClaude(systemPrompt, userMessage) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // or 'claude-3-opus-20240229'
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Claude API Error:', error.message);
    throw new Error(`Claude failed: ${error.message}`);
  }
}