import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Gemini service before importing agents
vi.mock('../services/gemini', () => ({
  callGemini: vi.fn().mockResolvedValue({ text: '', error: 'no_api_key' }),
}));

import { runMultiAgentSystem } from '../services/agents/coordinator';
import { navigatorNode, operationsNode, translatorNode, matchNode } from '../services/agents/specialists';
import { createInitialState } from '../services/agents/state';

describe('Multi-Agent Coordinator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes navigation queries to the navigator agent via keyword fallback', async () => {
    const state = await runMultiAgentSystem('Where is my seat?', 'sofi', 'English');

    expect(state.output).toBeTruthy();
    expect(state.executionTrace).toContain('supervisor');
    expect(state.executionTrace).toContain('navigator');
    expect(state.executionTrace).toContain('end');
  });

  it('routes medical emergency queries to the operations agent', async () => {
    const state = await runMultiAgentSystem('I need medical help', 'sofi', 'English');

    expect(state.output).toBeTruthy();
    expect(state.executionTrace).toContain('operations');
  });

  it('routes translation queries to the translator agent', async () => {
    const state = await runMultiAgentSystem('Translate hello to Spanish', 'sofi', 'English');

    expect(state.output).toBeTruthy();
    expect(state.executionTrace).toContain('translator');
  });

  it('routes match queries to the match agent', async () => {
    const state = await runMultiAgentSystem('What is the score?', 'sofi', 'English');

    expect(state.output).toBeTruthy();
    expect(state.executionTrace).toContain('match');
  });

  it('truncates excessively long queries to MAX_QUERY_LENGTH', async () => {
    const longQuery = 'a'.repeat(1000);
    const state = await runMultiAgentSystem(longQuery, 'sofi', 'English');

    // Should still produce output without crashing
    expect(state.output).toBeTruthy();
    expect(state.query.length).toBeLessThanOrEqual(500);
  });

  it('always records stepCount and executionTrace', async () => {
    const state = await runMultiAgentSystem('Tell me about the match', 'sofi', 'English');

    expect(state.stepCount).toBeGreaterThanOrEqual(1);
    expect(state.executionTrace.length).toBeGreaterThanOrEqual(3); // supervisor, specialist, end
  });
});

describe('Specialist Agents - Fallback Mode', () => {
  it('navigatorNode returns fallback directions for food queries', async () => {
    const initial = createInitialState('Where can I find food?', 'sofi', 'English');
    const result = await navigatorNode(initial);

    expect(result.currentNode).toBe('navigator');
    expect(result.output).toContain('Navigator Agent');
    expect(result.context.routePath).toBeDefined();
    expect(result.context.routePath!.length).toBeGreaterThan(0);
  });

  it('navigatorNode builds toilet route path', async () => {
    const initial = createInitialState('I need to find the restroom', 'sofi', 'English');
    const result = await navigatorNode(initial);

    expect(result.context.routePath).toBeDefined();
    expect(result.context.routePath!.some(s => s.instruction.includes('🚻'))).toBe(true);
  });

  it('operationsNode dispatches a medical crew', async () => {
    const initial = createInitialState('Someone is hurt near section 114', 'sofi', 'English');
    const result = await operationsNode(initial);

    expect(result.currentNode).toBe('operations');
    expect(result.context.dispatchStatus).toBeDefined();
    expect(result.context.dispatchStatus!.type).toBe('medical');
    expect(result.context.dispatchStatus!.etaMinutes).toBe(2);
    expect(result.context.dispatchStatus!.assignedCrew).toContain('First Aid');
  });

  it('operationsNode handles spill/cleanup requests', async () => {
    const initial = createInitialState('There is a spill on the floor', 'sofi', 'English');
    const result = await operationsNode(initial);

    expect(result.context.dispatchStatus!.type).toBe('spill');
    expect(result.context.dispatchStatus!.etaMinutes).toBe(5);
  });

  it('translatorNode returns translation with jargon for SoFi stadium', async () => {
    const initial = createInitialState('How do I take the bus?', 'sofi', 'English');
    const result = await translatorNode(initial);

    expect(result.currentNode).toBe('translator');
    expect(result.output).toContain('Translator Agent');
    expect(result.context.translationResult).toBeDefined();
  });

  it('matchNode returns commentator-style output', async () => {
    const initial = createInitialState('What is the current score?', 'sofi', 'English');
    const result = await matchNode(initial);

    expect(result.currentNode).toBe('match');
    expect(result.output).toContain('Match Commentator');
    expect(result.output).toContain('Brazil');
  });

  it('specialist agents do not mutate the original state', async () => {
    const initial = createInitialState('Find my seat', 'sofi', 'English');
    const originalNode = initial.currentNode;
    const originalTrace = [...initial.executionTrace];

    await navigatorNode(initial);

    // Original state should be unchanged (immutable pattern)
    expect(initial.currentNode).toBe(originalNode);
    expect(initial.executionTrace).toEqual(originalTrace);
  });
});
