import { useState, useCallback } from 'react';
import { callGemini, translateText, askStadiumAssistant } from '../services/gemini';

interface UseGeminiState {
  loading: boolean;
  error: string | null;
}

/**
 * Hook for Gemini API interactions with loading + error state management.
 */
export function useGemini() {
  const [state, setState] = useState<UseGeminiState>({ loading: false, error: null });

  const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setState({ loading: true, error: null });
    try {
      const result = await fn();
      setState({ loading: false, error: null });
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setState({ loading: false, error: msg });
      return null;
    }
  }, []);

  const translate = useCallback(
    (text: string, from: string, to: string) =>
      withLoading(() => translateText(text, from, to)),
    [withLoading]
  );

  const ask = useCallback(
    (question: string, stadium: string, language: string) =>
      withLoading(() => askStadiumAssistant(question, stadium, language)),
    [withLoading]
  );

  const generate = useCallback(
    (prompt: string, systemPrompt?: string) =>
      withLoading(() => callGemini({ prompt, systemPrompt }).then((r) => r.text)),
    [withLoading]
  );

  return { ...state, translate, ask, generate };
}
