import { callGPT } from '../agents/gpt.js';
import { callGemini } from '../agents/gemini.js';
import { initiatorPrompt } from '../prompts/initiator.js';
import { criticPrompt } from '../prompts/critic.js';
import { verifierPrompt } from '../prompts/verifier.js';
import { synthesizerPrompt } from '../prompts/synthesizer.js';
import { finalSynthesizerPrompt } from '../prompts/finalSynthesizer.js';

// Helper function to add delays between API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Run the complete multi-agent debate pipeline
 * @param {string} query - The user's question
 * @returns {Promise<Object>} - Complete debate results
 */
export async function runPipeline(query) {
  const startTime = Date.now();
  const responses = [];

  try {
    // Step 1: GPT as Initiator
    console.log('[PIPELINE] Step 1/5: GPT Initiator...');
    const gptInitiator = await callGPT(initiatorPrompt, query);
    responses.push({
      agent: 'GPT',
      role: 'INITIATOR',
      content: gptInitiator,
      timestamp: Date.now() - startTime,
    });

    await delay(1000); // Wait 1 second before next Gemini call

    // Step 2: Gemini as Critic (displayed as "Claude" in frontend)
    console.log('[PIPELINE] Step 2/5: Claude Critic (actually Gemini)...');
    const claudeCritic = await callGemini(
      criticPrompt,
      `Original Query: "${query}"\n\nInitial Answer:\n${gptInitiator}\n\nProvide your critique.`
    );
    responses.push({
      agent: 'CLAUDE', // Frontend shows "Claude" but it's Gemini
      role: 'CRITIC',
      content: claudeCritic,
      timestamp: Date.now() - startTime,
    });

    await delay(1000); // Wait 1 second before next Gemini call

    // Step 3: Gemini as Synthesizer
    console.log('[PIPELINE] Step 3/5: Gemini Synthesizer...');
    const geminiSynthesizer = await callGemini(
      synthesizerPrompt,
      `Original Query: "${query}"\n\nInitial Answer:\n${gptInitiator}\n\nCritique:\n${claudeCritic}\n\nSynthesize the debate and provide your take.`
    );
    responses.push({
      agent: 'GEMINI',
      role: 'SYNTHESIZER',
      content: geminiSynthesizer,
      timestamp: Date.now() - startTime,
    });

    await delay(1000); // Wait 1 second before next Gemini call

    // Step 4: Gemini as Verifier (displayed as "Mistral" in frontend)
    console.log('[PIPELINE] Step 4/5: Mistral Verifier (actually Gemini)...');
    const mistralVerifier = await callGemini(
      verifierPrompt,
      `Original Query: "${query}"\n\nInitial Answer:\n${gptInitiator}\n\nCritique:\n${claudeCritic}\n\nSynthesis:\n${geminiSynthesizer}\n\nFact-check the claims and provide verification.`
    );
    responses.push({
      agent: 'MISTRAL', // Frontend shows "Mistral" but it's Gemini
      role: 'VERIFIER',
      content: mistralVerifier,
      timestamp: Date.now() - startTime,
    });

    await delay(1000); // Wait 1 second before final GPT call

    // Step 5: GPT as Final Synthesizer (HIDDEN from user)
    console.log('[PIPELINE] Step 5/5: GPT Final Synthesis (hidden)...');
    const gptFinal = await callGPT(
      finalSynthesizerPrompt,
      `Original Query: "${query}"\n\nFull Debate History:\n\n1. Initial Answer:\n${gptInitiator}\n\n2. Critique:\n${claudeCritic}\n\n3. Synthesis:\n${geminiSynthesizer}\n\n4. Verification:\n${mistralVerifier}\n\nCreate the final, polished answer (DO NOT mention AI names).`
    );

    const totalTime = Date.now() - startTime;
    console.log(`[PIPELINE] Complete in ${(totalTime / 1000).toFixed(2)}s`);

    return {
      query,
      responses, // Contains: GPT, CLAUDE (Gemini), GEMINI, MISTRAL (Gemini)
      finalAnswer: gptFinal, // Hidden GPT synthesis - only answer shown
      metadata: {
        totalTime,
        completedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('[PIPELINE] Error:', error.message);
    throw error;
  }
}