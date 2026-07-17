import { useState, useCallback, useRef } from 'react';
import { Volume2, RefreshCw } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import { LANGUAGES, OFFLINE_PHRASES } from '../data/languages';
import { translateText } from '../services/gemini';
import type { Language, TranslationMessage } from '../types';

export function TranslatorPage() {
  const [langA, setLangA] = useState<Language>(LANGUAGES[0]); // English
  const [langB, setLangB] = useState<Language>(LANGUAGES[1]); // Spanish
  const [messages, setMessages] = useState<TranslationMessage[]>([]);
  const [translating, setTranslating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const [draftText, setDraftText] = useState('');
  const [draftLang, setDraftLang] = useState<'a' | 'b' | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const speechA = useSpeech({
    lang: langA.code,
    onResult: (transcript) => {
      setDraftText(transcript);
      setDraftLang('a');
    },
    onError: (e) => setStatusMsg(`Mic error: ${e}`),
  });

  const speechB = useSpeech({
    lang: langB.code,
    onResult: (transcript) => {
      setDraftText(transcript);
      setDraftLang('b');
    },
    onError: (e) => setStatusMsg(`Mic error: ${e}`),
  });

  const handleTranslate = useCallback(async (text: string, direction: 'a-to-b' | 'b-to-a') => {
    if (!text.trim()) return;
    setTranslating(true);
    setStatusMsg('Translating…');

    const from = direction === 'a-to-b' ? langA.name : langB.name;
    const to   = direction === 'a-to-b' ? langB.name : langA.name;
    const toLang = direction === 'a-to-b' ? langB : langA;

    const translated = await translateText(text, from, to);

    const msg: TranslationMessage = {
      id: `msg-${Date.now()}`,
      originalText: text,
      translatedText: translated,
      fromLang: from, toLang: to,
      direction,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, msg]);
    setTranslating(false);
    setStatusMsg('');

    // Speak the translated result using the correct hook
    const speakerSpeech = direction === 'a-to-b' ? speechB : speechA;
    speakerSpeech.speak(translated, toLang.code);

    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [langA, langB, speechA, speechB]);

  const handleTranslateDraft = async () => {
    if (!draftText.trim() || !draftLang) return;
    const direction = draftLang === 'a' ? 'a-to-b' : 'b-to-a';
    await handleTranslate(draftText, direction);
    setDraftText('');
    setDraftLang(null);
  };

  const clearDraft = () => {
    setDraftText('');
    setDraftLang(null);
  };

  const swapLanguages = () => {
    setLangA(langB);
    setLangB(langA);
    setMessages([]);
    clearDraft();
  };

  const replayMessage = (msg: TranslationMessage) => {
    const toCode = msg.direction === 'a-to-b' ? langB.code : langA.code;
    const speakerSpeech = msg.direction === 'a-to-b' ? speechB : speechA;
    speakerSpeech.speak(msg.translatedText, toCode);
  };



  return (
    <main
      style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px', gap: '12px' }}
      aria-label="Conversation translator"
    >
      {/* Language selector */}
      <div
        className="surface-card"
        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}
        aria-label="Language pair selector"
      >
        <select
          id="lang-a-select"
          className="input"
          style={{ flex: 1, padding: '8px 10px' }}
          value={langA.code}
          onChange={(e) => setLangA(LANGUAGES.find((l) => l.code === e.target.value) ?? langA)}
          aria-label="Your language (Language A)"
        >
          {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.nativeName}</option>)}
        </select>

        <button
          id="swap-languages-btn"
          className="btn btn-icon"
          onClick={swapLanguages}
          aria-label="Swap languages"
          style={{ flexShrink: 0, background: 'var(--accent-gold-dim)', borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' }}
        >
          <RefreshCw size={16} />
        </button>

        <select
          id="lang-b-select"
          className="input"
          style={{ flex: 1, padding: '8px 10px' }}
          value={langB.code}
          onChange={(e) => setLangB(LANGUAGES.find((l) => l.code === e.target.value) ?? langB)}
          aria-label="Other person's language (Language B)"
        >
          {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.nativeName}</option>)}
        </select>
      </div>

      {/* Chat history */}
      <div
        className="flex flex-col gap-md"
        style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '4px 0' }}
        role="log"
        aria-live="polite"
        aria-label="Translation conversation history"
      >
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }} aria-hidden>🌐</div>
            <p className="text-sm">Hold a mic button and speak to start translating</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`bubble ${msg.direction === 'a-to-b' ? 'bubble-a' : 'bubble-b'}`}
            aria-label={`${msg.direction === 'a-to-b' ? 'You said' : 'They said'}: ${msg.originalText}, translated: ${msg.translatedText}`}
          >
            <div className="flex items-center gap-sm" style={{ marginBottom: '4px' }}>
              <span className="text-xs text-muted">{msg.direction === 'a-to-b' ? langB.flag : langA.flag}</span>
              <span className="text-xs font-semibold" style={{ color: msg.direction === 'a-to-b' ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                {msg.direction === 'a-to-b' ? `${langA.nativeName} ➔ ${langB.nativeName}` : `${langB.nativeName} ➔ ${langA.nativeName}`}
              </span>
            </div>
            <p className="bubble-original" style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
              {msg.translatedText}
            </p>
            <p className="bubble-translated" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'normal', marginTop: '4px' }}>
              Original ({msg.direction === 'a-to-b' ? langA.nativeName : langB.nativeName}): {msg.originalText}
            </p>
            <button
              className="btn btn-icon"
              style={{ width: 28, height: 28, marginTop: '6px', fontSize: '0.75rem' }}
              onClick={() => replayMessage(msg)}
              aria-label={`Replay translation of: ${msg.translatedText}`}
            >
              <Volume2 size={13} />
            </button>
          </div>
        ))}
        <div ref={chatEndRef} aria-hidden />
      </div>

      {/* Draft Staging Panel */}
      {draftText && (
        <div className="surface-card turf-glow" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--accent-green)' }}>
          <div className="flex justify-between items-center">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              📝 Draft ({draftLang === 'a' ? langA.nativeName : langB.nativeName})
            </span>
            <button className="text-xs text-muted" onClick={clearDraft}>Clear</button>
          </div>
          <div style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 500, textAlign: 'left' }}>
            {draftText}
          </div>
          <div className="flex gap-sm">
            <button 
              className="btn btn-primary" 
              style={{ flex: 1 }}
              onClick={handleTranslateDraft}
            >
              🔊 Translate & Play
            </button>
            <button 
              className="btn btn-ghost" 
              onClick={clearDraft}
              style={{ padding: '0 16px' }}
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}

      {/* Status */}
      {(translating || statusMsg) && (
        <div
          className="flex items-center gap-sm"
          style={{ padding: '8px 12px', background: 'var(--accent-green-dim)', borderRadius: 'var(--radius-md)' }}
          role="status"
          aria-live="polite"
        >
          {translating && <div className="spinner" style={{ width: 16, height: 16 }} aria-hidden />}
          <span className="text-sm text-green">{statusMsg || '🎤 Translating…'}</span>
        </div>
      )}

      {/* Quick Phrases */}
      <div className="surface-card" style={{ padding: '12px', border: '1px solid var(--border)' }}>
        <h3 className="text-xs text-muted" style={{ marginBottom: '8px', fontWeight: 600 }}>⚡ Quick Concourse Phrases</h3>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }} role="group" aria-label="Quick phrases">
          {Object.entries(OFFLINE_PHRASES[langA.code] || OFFLINE_PHRASES.en).map(([key, phraseText]) => (
            <button
              key={key}
              id={`quick-phrase-btn-${key}`}
              className="badge badge-glass"
              style={{ cursor: 'pointer', padding: '6px 12px', whiteSpace: 'nowrap', fontSize: '0.8rem', display: 'inline-block' }}
              onClick={() => handleTranslate(phraseText, 'a-to-b')}
              disabled={translating}
            >
              {phraseText}
            </button>
          ))}
        </div>
      </div>

      {/* Mic Buttons */}
      <div
        className="grid-2"
        style={{ gap: '8px' }}
        role="group"
        aria-label="Voice input buttons"
      >
        <button
          id="mic-btn-a"
          className={`mic-btn mic-btn-a${speechA.isListening ? ' recording' : ''}`}
          onPointerDown={() => speechA.startListening()}
          onPointerUp={() => speechA.stopListening()}
          onPointerLeave={() => speechA.stopListening()}
          aria-label={`Hold to speak in ${langA.nativeName}`}
          aria-pressed={speechA.isListening}
          disabled={translating}
        >
          <span className="mic-btn-icon" aria-hidden>🎤</span>
          <span>{speechA.isListening ? 'Listening…' : `Hold: ${langA.nativeName}`}</span>
          <span className="text-xs opacity-60">{langA.flag}</span>
        </button>

        <button
          id="mic-btn-b"
          className={`mic-btn mic-btn-b${speechB.isListening ? ' recording' : ''}`}
          onPointerDown={() => speechB.startListening()}
          onPointerUp={() => speechB.stopListening()}
          onPointerLeave={() => speechB.stopListening()}
          aria-label={`Hold to speak in ${langB.nativeName}`}
          aria-pressed={speechB.isListening}
          disabled={translating}
        >
          <span className="mic-btn-icon" aria-hidden>🎤</span>
          <span>{speechB.isListening ? 'Listening…' : `Hold: ${langB.nativeName}`}</span>
          <span className="text-xs opacity-60">{langB.flag}</span>
        </button>
      </div>
    </main>
  );
}
