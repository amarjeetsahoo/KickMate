export interface AgentState {
  query: string;
  stadiumId: string;
  language: string;
  stepCount: number;
  currentNode: string;
  executionTrace: string[];
  context: {
    routePath?: {
      instruction: string;
      landmark?: string;
      floor?: number;
      estimatedMinutes: number;
    }[];
    dispatchStatus?: {
      type: string;
      status: 'pending' | 'acknowledged' | 'resolved';
      etaMinutes: number;
      assignedCrew: string;
    };
    translationResult?: {
      translatedText: string;
      jargonExplained?: string;
    };
    matchCommentary?: string;
  };
  output: string;
}

export function createInitialState(query: string, stadiumId: string, language: string): AgentState {
  return {
    query,
    stadiumId,
    language,
    stepCount: 0,
    currentNode: 'supervisor',
    executionTrace: [],
    context: {},
    output: '',
  };
}
