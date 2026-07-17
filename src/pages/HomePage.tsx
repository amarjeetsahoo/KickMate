import { useState, useCallback } from 'react';
import { Compass, Utensils, MessageSquare, Languages, MapPin, Camera } from 'lucide-react';
import { MOCK_LIVE_MATCH, SUSTAINABILITY_TIPS, ASSISTANT_SUGGESTIONS } from '../data/mockData';
import { STADIUMS } from '../data/stadiums';
import { storage } from '../services/storage';
import { runMultiAgentSystem } from '../services/agents/coordinator';
import { useSpeech } from '../hooks/useSpeech';
import type { NavTab } from '../components/layout/BottomNav';

interface HomePageProps {
  onNavigate: (tab: NavTab) => void;
}

const GREETINGS = [
  { context: 'morning',  text: '☀️ Good morning, fan!', sub: 'Ready for kick-off?' },
  { context: 'day',     text: '⚽ Match day vibes!',   sub: 'Your guide is ready.' },
  { context: 'evening', text: '🌙 Evening kick-off!',  sub: 'Enjoy the game!' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return GREETINGS[0];
  if (h < 18) return GREETINGS[1];
  return GREETINGS[2];
}

export function HomePage({ onNavigate }: HomePageProps) {
  const greeting = getGreeting();
  const match = MOCK_LIVE_MATCH;
  const stadiumId = storage.getStadium() ?? 'sofi';
  const stadium = STADIUMS.find((s) => s.id === stadiumId) ?? STADIUMS[0];
  const [tipIdx] = useState(() => Math.floor(Math.random() * SUSTAINABILITY_TIPS.length));
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTrace, setAiTrace] = useState<string[]>([]);

  const askAI = useCallback(async (q: string) => {
    setAiLoading(true);
    setAiTrace([]);
    setAiAnswer('');
    const state = await runMultiAgentSystem(q, stadiumId, storage.getLanguage());
    setAiAnswer(state.output);
    setAiTrace(state.executionTrace);
    setAiLoading(false);
  }, [stadiumId]);

  const quickActions = [
    { icon: <Compass size={28} />, label: 'Find My Seat', color: 'var(--accent-blue)',   tab: 'navigate' as NavTab, glow: 'rgba(59,130,246,0.2)' },
    { icon: <Utensils size={28} />, label: 'Food & Merch', color: 'var(--accent-green)',  tab: 'food' as NavTab, glow: 'rgba(0,197,94,0.2)' },
    { icon: <MessageSquare size={28} />, label: 'Fan Social Wall', color: 'var(--accent-purple)', tab: 'social' as NavTab, glow: 'rgba(139,92,246,0.2)' },
    { icon: <Languages size={28} />, label: 'Translator',  color: 'var(--accent-teal)',   tab: 'translate' as NavTab, glow: 'rgba(20,184,166,0.2)' },
    { icon: <MapPin size={28} />, label: 'Parking',     color: 'var(--accent-amber)',  tab: 'more' as NavTab, glow: 'rgba(245,158,11,0.2)' },
    { icon: <Camera size={28} />, label: 'Camera Translate', color: 'var(--accent-red)', tab: 'translate' as NavTab, glow: 'rgba(255,59,59,0.2)' },
  ];



  const [activeMode, setActiveMode] = useState<'text' | 'voice'>('text');
  const [inputText, setInputText] = useState('');

  const onSpeechResult = useCallback((transcript: string) => {
    setInputText(transcript);
    askAI(transcript);
  }, [askAI]);

  const { isListening, startListening, stopListening, isSupported } = useSpeech({
    lang: 'en-US',
    onResult: onSpeechResult
  });

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    askAI(inputText);
  };

  return (
    <main
      style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}
      aria-label="KickMate home"
    >
      {/* Greeting */}
      <div>
        <h1 className="h2">{greeting.text}</h1>
        <p className="text-muted text-sm">{greeting.sub}</p>
      </div>

      {/* Stadium Hero Card */}
      <div
        className="glass-card hex-bg"
        style={{
          background: 'linear-gradient(135deg, var(--bg-card), var(--bg-surface))',
          padding: '20px',
        }}
        role="region"
        aria-label={`Current stadium: ${stadium.name}`}
      >
        <div className="flex items-center gap-md" style={{ marginBottom: '12px' }}>
          <span style={{ fontSize: '1.5rem' }} aria-hidden>🏟️</span>
          <div>
            <div style={{ fontFamily: 'Figtree', fontWeight: 700, color: 'var(--text-primary)' }}>{stadium.name}</div>
            <div className="text-muted text-xs">{stadium.city}, {stadium.state}</div>
          </div>
          <span className="badge badge-green" style={{ marginLeft: 'auto' }} aria-label="Stadium selected">
            Selected
          </span>
        </div>

        {/* Live match ticker */}
        {match.status === 'live' && (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', background: 'var(--accent-red-dim)',
              borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,59,59,0.2)',
              cursor: 'pointer',
            }}
            onClick={() => onNavigate('match')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('match')}
            aria-label={`Live match: ${match.homeTeam.name} ${match.homeTeam.score} - ${match.awayTeam.score} ${match.awayTeam.name}, minute ${match.minute}`}
          >
            <span className="badge badge-live" aria-hidden>● LIVE</span>
            <span style={{ fontFamily: 'Figtree', fontWeight: 700 }}>
              {match.homeTeam.flag} {match.homeTeam.code} {match.homeTeam.score}–{match.awayTeam.score} {match.awayTeam.code} {match.awayTeam.flag}
            </span>
            <span className="text-muted text-sm" style={{ marginLeft: 'auto' }}>{match.minute}'</span>
          </div>
        )}
      </div>

      {/* Quick Actions Grid */}
      <section aria-label="Quick actions">
        <h2 className="h3" style={{ marginBottom: '12px' }}>What do you need?</h2>
        <div className="grid-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              id={`quick-action-btn-${action.tab}`}
              className="glass-card card-3d turf-glow"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '12px', padding: '24px 12px', textAlign: 'center',
                border: `1px solid ${action.glow.replace('0.2', '0.35')}`,
                fontFamily: 'Figtree',
                fontWeight: 600, fontSize: '0.875rem', color: action.color,
                background: action.glow.replace('0.2', '0.08'),
              }}
              onClick={() => onNavigate(action.tab)}
              aria-label={action.label}
            >
              <span style={{ color: action.color }} aria-hidden>{action.icon}</span>
              <span style={{ color: 'var(--text-primary)', marginTop: '4px' }}>{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* AI Quick Ask */}
      <section
        className="surface-card"
        style={{ padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}
        aria-label="AI assistant"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 className="h3" style={{ margin: 0 }}>⚡ Quick Ask</h2>
          <div style={{ display: 'flex', background: 'var(--bg-glass)', borderRadius: 'var(--radius-full)', padding: '2px' }}>
            <button
              style={{
                fontSize: '0.75rem', padding: '4px 10px', borderRadius: 'var(--radius-full)',
                background: activeMode === 'text' ? 'var(--accent-green)' : 'transparent',
                color: activeMode === 'text' ? 'var(--text-inverse)' : 'var(--text-secondary)',
                fontWeight: 600
              }}
              onClick={() => setActiveMode('text')}
              aria-label="Switch to text input mode"
              aria-pressed={activeMode === 'text'}
            >
              Text
            </button>
            <button
              style={{
                fontSize: '0.75rem', padding: '4px 10px', borderRadius: 'var(--radius-full)',
                background: activeMode === 'voice' ? 'var(--accent-green)' : 'transparent',
                color: activeMode === 'voice' ? 'var(--text-inverse)' : 'var(--text-secondary)',
                fontWeight: 600
              }}
              onClick={() => setActiveMode('voice')}
              aria-label="Switch to voice input mode"
              aria-pressed={activeMode === 'voice'}
            >
              Voice
            </button>
          </div>
        </div>

        {/* Input Mode Rendering */}
        {activeMode === 'text' ? (
          <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Ask anything about the stadium..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input"
              style={{ flex: 1, height: '40px' }}
              maxLength={500}
              aria-label="Type your question for the AI assistant"
            />
            <button className="btn btn-green" type="submit" style={{ height: '40px', padding: '0 16px' }}>
              Ask
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 0', marginBottom: '12px' }}>
            {isSupported ? (
              <button
                className={`mic-btn ${isListening ? 'active' : ''}`}
                style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: isListening ? 'var(--accent-red)' : 'var(--accent-green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', color: '#fff', cursor: 'pointer',
                  border: 'none', animation: isListening ? 'sos-pulse 1.5s infinite' : 'none',
                  boxShadow: isListening ? 'var(--shadow-red)' : 'var(--shadow-green)'
                }}
                onMouseDown={startListening}
                onMouseUp={stopListening}
                onTouchStart={startListening}
                onTouchEnd={stopListening}
                aria-label="Hold to talk to KickMate"
              >
                {isListening ? '🎤' : '🎙️'}
              </button>
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Voice recognition not supported in this browser.</span>
            )}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {isListening ? 'Listening… release when done' : 'Hold mic button & ask your query'}
            </span>
          </div>
        )}

        <div
          style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}
          role="list"
          aria-label="Suggested questions"
        >
          {ASSISTANT_SUGGESTIONS.slice(0, 4).map((s, i) => (
            <button
              key={s}
              id={`suggest-question-btn-${i}`}
              role="listitem"
              className="badge badge-glass"
              style={{ cursor: 'pointer', fontFamily: 'Inter', padding: '6px 10px' }}
              onClick={() => {
                setInputText(s);
                askAI(s);
              }}
            >
              {s}
            </button>
          ))}
        </div>
        {aiLoading && (
          <div id="ai-loading-indicator" className="flex items-center gap-sm" aria-live="polite" aria-busy="true">
            <div className="spinner" aria-hidden />
            <span className="text-muted text-sm">KickMate is thinking…</span>
          </div>
        )}
        {aiTrace.length > 0 && (
          <div
            id="ai-agent-trace"
            style={{
              display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center',
              marginBottom: '8px', fontSize: '0.75rem', color: 'var(--text-muted)'
            }}
          >
            <span style={{ fontWeight: 600 }}>🤖 Workflow:</span>
            {aiTrace.map((node, i) => (
              <span key={i} className="badge badge-glass" style={{ fontSize: '0.7rem', padding: '2px 6px', textTransform: 'capitalize' }}>
                {node}
              </span>
            ))}
          </div>
        )}
        {aiAnswer && !aiLoading && (
          <div
            id="ai-response-box"
            style={{
              padding: '12px', background: 'var(--accent-green-dim)',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--border-active)',
              fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-primary)',
            }}
            role="status"
            aria-live="polite"
          >
            ⚽ {aiAnswer}
          </div>
        )}
      </section>

      {/* Sustainability Tip */}
      <div
        className="glass-card"
        style={{ background: 'rgba(0,197,94,0.06)', border: '1px solid var(--border-active)' }}
        role="complementary"
        aria-label="Sustainability tip"
      >
        <p className="text-sm" style={{ lineHeight: 1.5 }}>{SUSTAINABILITY_TIPS[tipIdx]}</p>
      </div>
    </main>
  );
}
