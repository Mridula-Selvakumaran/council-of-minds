import { callGPT } from '../agents/gpt.js';
import { callClaude } from '../agents/claude.js';
import { callGemini } from '../agents/gemini.js';
import { callGrok } from '../agents/grok.js';
import { initiatorPrompt } from '../prompts/initiator.js';
import { criticPrompt } from '../prompts/critic.js';
import { verifierPrompt } from '../prompts/verifier.js';
import { synthesizerPrompt } from '../prompts/synthesizer.js';
import { finalSynthesizerPrompt } from '../prompts/finalSynthesizer.js';

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

    // Step 2: Claude as Critic
    console.log('[PIPELINE] Step 2/5: Claude Critic...');
    const claudeCritic = await callClaude(
      criticPrompt,
      `Original Query: "${query}"\n\nInitial Answer:\n${gptInitiator}\n\nProvide your critique.`
    );
    responses.push({
      agent: 'CLAUDE',
      role: 'CRITIC',
      content: claudeCritic,
      timestamp: Date.now() - startTime,
    });

    // Step 3: Gemini as Verifier
    console.log('[PIPELINE] Step 3/5: Gemini Verifier...');
    const geminiVerifier = await callGemini(
      verifierPrompt,
      `Original Query: "${query}"\n\nInitial Answer:\n${gptInitiator}\n\nCritique:\n${claudeCritic}\n\nFact-check the claims and provide verification.`
    );
    responses.push({
      agent: 'GEMINI',
      role: 'VERIFIER',
      content: geminiVerifier,
      timestamp: Date.now() - startTime,
    });

    // Step 4: Grok as Synthesizer
    console.log('[PIPELINE] Step 4/5: Grok Synthesizer...');
    const grokSynthesizer = await callGrok(
      synthesizerPrompt,
      `Original Query: "${query}"\n\nInitial Answer:\n${gptInitiator}\n\nCritique:\n${claudeCritic}\n\nFact-Check:\n${geminiVerifier}\n\nSynthesize the debate and provide your take.`
    );
    responses.push({
      agent: 'GROK',
      role: 'SYNTHESIZER',
      content: grokSynthesizer,
      timestamp: Date.now() - startTime,
    });

    // Step 5: GPT as Final Synthesizer
    console.log('[PIPELINE] Step 5/5: GPT Final Synthesis...');
    const gptFinal = await callGPT(
      finalSynthesizerPrompt,
      `Original Query: "${query}"\n\nFull Debate History:\n\n1. Initial Answer:\n${gptInitiator}\n\n2. Critique:\n${claudeCritic}\n\n3. Fact-Check:\n${geminiVerifier}\n\n4. Synthesis:\n${grokSynthesizer}\n\nCreate the final, polished answer (DO NOT mention AI names).`
    );

    const totalTime = Date.now() - startTime;
    console.log(`[PIPELINE] ✅ Complete in ${(totalTime / 1000).toFixed(2)}s`);

    return {
      query,
      responses,
      finalAnswer: gptFinal,
      metadata: {
        totalTime,
        completedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('[PIPELINE] ❌ Error:', error.message);
    throw error;
  }
}