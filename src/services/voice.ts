// src/services/voice.ts

// ─── Text-to-Speech (TTS) ───────────────────────────────────────────────────

export function speakText(text: string, lang: string = 'en-US') {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech Synthesis not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Attempt to find a natural-sounding voice for the language
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith(lang) && (v.name.includes('Google') || v.name.includes('Premium'))
    );
    if (preferredVoice) utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
}

// ─── Speech-to-Text (STT) ───────────────────────────────────────────────────

// Extend Window interface for standard and webkit prefixes
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function listenForSpeech(
  lang: string = 'en-US',
  onResult: (text: string) => void,
  onError: (error: string) => void,
  onEnd: () => void
): { stop: () => void } | null {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    onError('Speech recognition not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error);
    onError(event.error);
  };

  recognition.onend = () => {
    onEnd();
  };

  try {
    recognition.start();
  } catch (err) {
    console.error('Failed to start speech recognition:', err);
    onError('Failed to start listening.');
  }

  return {
    stop: () => {
      recognition.stop();
    },
  };
}
