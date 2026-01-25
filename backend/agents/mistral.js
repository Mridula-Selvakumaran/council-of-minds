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
    // Format prompt according to Mistral's instruction format
    // Combine system prompt and user message in the [INST] format
    const formattedPrompt = `<s>[INST] ${systemPrompt}

${userMessage} [/INST]`;

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${process.env.HUGGINGFACE_MODEL}`,
      {
        inputs: formattedPrompt,
        parameters: {
          max_new_tokens: 1500,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false,
          do_sample: true,
          stop: ["</s>", "[INST]"]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Mistral API Response:', response.data);

    // Handle different response formats
    let generatedText = '';
    
    if (Array.isArray(response.data)) {
      // Legacy format: array of objects
      if (response.data[0]?.generated_text) {
        generatedText = response.data[0].generated_text;
      }
    } else if (response.data?.generated_text) {
      // New format: single object
      generatedText = response.data.generated_text;
    } else if (typeof response.data === 'string') {
      // Direct string response
      generatedText = response.data;
    } else {
      console.error('Unexpected response format:', response.data);
      throw new Error('Unexpected response format from Mistral API');
    }

    // Clean up the response - remove any remaining instruction tokens
    generatedText = generatedText
      .replace(/\[\/INST\]/g, '')
      .replace(/\[INST\]/g, '')
      .replace(/<s>/g, '')
      .replace(/<\/s>/g, '')
      .trim();

    if (!generatedText) {
      throw new Error('Empty response from Mistral API');
    }

    return generatedText;
  } catch (error) {
    console.error('Mistral API Error:', error.response?.data || error.message);
    console.error('Full error:', error);
    
    // Provide more specific error messages
    if (error.response?.status === 401) {
      throw new Error('Mistral failed: Invalid Hugging Face API key');
    } else if (error.response?.status === 503) {
      throw new Error('Mistral failed: Model is currently loading, please try again in a few minutes');
    } else if (error.response?.status === 429) {
      throw new Error('Mistral failed: Rate limit exceeded, please try again later');
    }
    
    throw new Error(`Mistral failed: ${error.message}`);
  }
}