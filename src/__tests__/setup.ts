import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', { value: vi.fn(), writable: true });

// Mock SpeechSynthesis
Object.defineProperty(window, 'speechSynthesis', {
  value: { speak: vi.fn(), cancel: vi.fn() },
  writable: true,
});

// Mock SpeechRecognition
(window as Window & { SpeechRecognition?: unknown }).SpeechRecognition = vi.fn(() => ({
  lang: '',
  interimResults: false,
  maxAlternatives: 1,
  onresult: null,
  onerror: null,
  onend: null,
  start: vi.fn(), stop: vi.fn(), abort: vi.fn(),
  addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));
