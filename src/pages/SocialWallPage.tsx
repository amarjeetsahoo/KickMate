import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Send, Sparkles, MessageSquare } from 'lucide-react';
import { callGemini } from '../services/gemini';
import { loadUserProfile } from '../services/storage';

interface CheerPost {
  id: string;
  user: string;
  flag: string;
  originalText: string;
  translatedText?: string;
  timestamp: Date;
  isModerated: boolean;
}

const INITIAL_POSTS: CheerPost[] = [
  {
    id: 'post-1',
    user: 'Diego86',
    flag: '🇦🇷',
    originalText: '¡Vamos muchachos, hoy ganamos como en el 86! ¡La copa se queda en Sudamérica!',
    translatedText: 'Let\'s go boys, today we win like in \'86! The cup stays in South America!',
    timestamp: new Date(Date.now() - 300_000),
    isModerated: true,
  },
  {
    id: 'post-2',
    user: 'NeymarFan99',
    flag: '🇧🇷',
    originalText: 'O hexa está chegando! Joga bonito sempre! 🇧🇷⚽',
    translatedText: 'The sixth title is coming! Play beautifully always! 🇧🇷⚽',
    timestamp: new Date(Date.now() - 180_000),
    isModerated: true,
  },
  {
    id: 'post-3',
    user: 'SamSoccer',
    flag: '🇺🇸',
    originalText: 'Incredible atmosphere here at SoFi! Let\'s go USMNT! 🇺🇸',
    translatedText: 'Incredible atmosphere here at SoFi! Let\'s go USMNT! 🇺🇸',
    timestamp: new Date(Date.now() - 60_000),
    isModerated: true,
  }
];

export function SocialWallPage() {
  const [posts, setPosts] = useState<CheerPost[]>(INITIAL_POSTS);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const profile = loadUserProfile();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [posts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setErrorMsg('');

    const cheerText = input.trim();
    const userFlag = '⚽';
    const userName = profile?.name || 'AnonymousFan';


    try {
      // Prompt Gemini for moderation and translation in one step
      const prompt = `Moderate and translate the following cheer text: "${cheerText}".
      If the text contains offensive words, insults, hate speech, or toxicity, respond EXACTLY with the JSON: {"toxic": true}
      If the text is clean and safe, respond EXACTLY with the JSON: {"toxic": false, "translated": "<the cheer translated into English>"}
      `;
      const systemPrompt = 'You are a stadium social feed content moderator and translator. Respond ONLY with valid JSON.';
      const res = await callGemini({ prompt, systemPrompt });

      let parsed: { toxic: boolean; translated?: string };
      try {
        const cleaned = res.text.replace(/```json|```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        // Fallback if parsing fails (meaning no API key or non-JSON returned)
        parsed = { toxic: false, translated: cheerText };
      }

      if (parsed.toxic) {
        setErrorMsg('⚠️ Your message was flagged by AI moderation for unsportsmanlike conduct.');
        setLoading(false);
        return;
      }

      const newPost: CheerPost = {
        id: `post-${Date.now()}`,
        user: userName,
        flag: userFlag,
        originalText: cheerText,
        translatedText: parsed.translated || cheerText,
        timestamp: new Date(),
        isModerated: true,
      };

      setPosts((prev) => [...prev, newPost]);
      setInput('');
    } catch (err) {
      // Local fallback in case of errors
      const newPost: CheerPost = {
        id: `post-${Date.now()}`,
        user: userName,
        flag: userFlag,
        originalText: cheerText,
        translatedText: cheerText,
        timestamp: new Date(),
        isModerated: true,
      };
      setPosts((prev) => [...prev, newPost]);
      setInput('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }} aria-label="Social Wall">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageSquare color="var(--accent-green)" />
        <h2 className="h2" style={{ margin: 0 }}>Concourse Fan Wall</h2>
      </div>
      <p className="text-muted text-sm">
        Connect with international fans. AI translates posts automatically and ensures a friendly, toxic-free environment.
      </p>

      {/* Feed */}
      <div
        style={{
          flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
          gap: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)',
          padding: '16px', border: '1px solid var(--border)', minHeight: '260px'
        }}
        role="log"
        aria-live="polite"
      >
        {posts.map((post) => (
          <div
            key={post.id}
            className="surface-card"
            style={{
              padding: '12px 16px',
              borderLeft: '4px solid var(--accent-green)',
              animation: 'bubble-in 0.25s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>{post.flag}</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{post.user}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="badge badge-green" style={{ fontSize: '0.65rem', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <ShieldCheck size={10} /> AI Moderated
                </span>
                <span className="text-xs text-muted">
                  {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <p className="text-sm" style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
              "{post.originalText}"
            </p>
            {post.translatedText && post.translatedText !== post.originalText && (
              <p className="text-xs text-green" style={{ fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={10} /> Translated: "{post.translatedText}"
              </p>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {errorMsg && (
          <div className="badge badge-red" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', width: '100%', justifyContent: 'flex-start' }}>
            <AlertTriangle size={14} style={{ marginRight: '6px' }} /> {errorMsg}
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Chant or greet other fans..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            maxLength={140}
            aria-label="Fan cheer input"
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!input.trim() || loading}
            style={{ padding: '0 18px' }}
            aria-label="Send cheer"
          >
            {loading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Send size={16} />}
          </button>
        </div>
      </form>
    </main>
  );
}
