import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Call Mistral AI via Hugging Face Inference API
 * @param {string} systemPrompt - The system prompt defining Mistral's role
 * @param {string} userMessage - The user's query or context
 * @returns {Promise<string>} - Mistral's response
 */
export async function callMistral(systemPrompt, userMessage) {
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${process.env.HUGGINGFACE_MODEL}`,
      {
        inputs: `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`,
        parameters: {
          max_new_tokens: 1500,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false,
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Handle response format
    if (Array.isArray(response.data) && response.data[0]?.generated_text) {
      return response.data[0].generated_text;
    }
    
    return response.data.generated_text || response.data;
  } catch (error) {
    console.error('Mistral API Error:', error.response?.data || error.message);
    console.error('Full error:', error);
    throw new Error(`Mistral failed: ${error.message}`);
  }
}