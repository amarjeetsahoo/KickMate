import { createInitialState, type AgentState } from './state';
import { navigatorNode, operationsNode, translatorNode, matchNode } from './specialists';
import { callGemini } from '../gemini';

/**
 * Supervisor agent that routes fan queries to the appropriate specialist agent.
 * Fallbacks to keyword matching if the LLM query fails or API key is absent.
 */
async function supervisorRoute(state: AgentState): Promise<string> {
  const query = state.query.toLowerCase();
  
  // Try to use Gemini to perform the supervisor routing classification
  try {
    const prompt = `Classify this fan query into the most suitable agent. Respond with exactly one word from this list: 'navigator', 'operations', 'translator', or 'match'.
    
    Guidelines:
    - 'navigator': seat, toilet, restroom, food court, gates, parking bays, walk paths.
    - 'operations': emergency, spills, cleanup requests, medical aid, security alarms, first aid dispatches.
    - 'translator': word translations, language translator, regional dialect/slang, transport jargon.
    - 'match': live scores, match stats, goals, scorers, match commentary.
    
    Fan query: "${state.query}"`;
    
    const systemPrompt = "You are the head Supervisor Agent of KickMate. You classify queries into: navigator, operations, translator, match. Output ONLY the agent name.";
    const res = await callGemini({ prompt, systemPrompt });
    
    const choice = res.text.trim().toLowerCase().replace(/['"[\]]/g, '');
    if (['navigator', 'operations', 'translator', 'match'].includes(choice)) {
      return choice;
    }
  } catch {
    // LLM classification failed or key is missing, fall back to keyword-based routing
  }

  // Keyword Fallback Router
  if (
    query.includes('spill') || query.includes('mess') || query.includes('clean') ||
    query.includes('cleanup') || query.includes('hurt') || query.includes('sick') ||
    query.includes('medical') || query.includes('security') || query.includes('sos') ||
    query.includes('emergency') || query.includes('injury') || query.includes('first aid')
  ) {
    return 'operations';
  }

  if (
    query.includes('translate') || query.includes('speak') || query.includes('say') ||
    query.includes('jargon') || query.includes('slang') || query.includes('metro') ||
    query.includes('bus') || query.includes('transit') || query.includes('train') ||
    query.includes('pronounce') || query.includes('word') || query.includes('how do you say')
  ) {
    return 'translator';
  }

  if (
    query.includes('score') || query.includes('match') || query.includes('play') ||
    query.includes('goal') || query.includes('stats') || query.includes('brazil') ||
    query.includes('argentina') || query.includes('scorer') || query.includes('minute') ||
    query.includes('card') || query.includes('yellow') || query.includes('red')
  ) {
    return 'match';
  }

  // Default to navigator for stadium layout, seat location questions
  return 'navigator';
}

/**
 * Main coordinator function that executes the multi-agent workflow loop.
 */
export async function runMultiAgentSystem(
  query: string,
  stadiumId: string,
  language: string
): Promise<AgentState> {
  let state = createInitialState(query, stadiumId, language);
  
  // Phase 1: Supervisor Analysis
  state.currentNode = 'supervisor';
  state.executionTrace.push('supervisor');
  
  const targetAgent = await supervisorRoute(state);
  state.stepCount++;
  
  // Phase 2: Execute Specialist Node
  if (targetAgent === 'operations') {
    state = await operationsNode(state);
  } else if (targetAgent === 'translator') {
    state = await translatorNode(state);
  } else if (targetAgent === 'match') {
    state = await matchNode(state);
  } else {
    state = await navigatorNode(state);
  }
  
  // Node sets state.currentNode to its own identifier.
  // Add terminal state logging
  state.executionTrace.push('end');
  return state;
}
