import { useState, useRef, useCallback } from 'react';
import { Camera, Volume2 } from 'lucide-react';
import { translateImageText } from '../services/gemini';
import { LANGUAGES } from '../data/languages';
import { storage } from '../services/storage';

export function CameraPage() {
  const [targetLang, setTargetLang] = useState(storage.getLanguage());
  const [result, setResult] = useState<{ extracted: string; translated: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lang = LANGUAGES.find((l) => l.code === targetLang) ?? LANGUAGES[0];

  const handleImage = useCallback(async (file: File) => {
    setResult(null);
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      const base64 = dataUrl.split(',')[1];
      const res = await translateImageText(base64, lang.name);
      setResult(res);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }, [lang.name]);

  const speak = () => {
    if (!result?.translated || !('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(result.translated);
    u.lang = targetLang;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <main style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Language target selector */}
      <div className="surface-card" style={{ padding: '12px 16px' }}>
        <label htmlFor="target-lang" className="text-sm text-muted" style={{ display: 'block', marginBottom: '6px' }}>
          Translate text to:
        </label>
        <select
          id="target-lang"
          className="input"
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          aria-label="Target translation language"
        >
          {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.nativeName}</option>)}
        </select>
      </div>

      {/* Camera trigger */}
      <button
        className="btn btn-primary btn-full"
        style={{ padding: '20px', fontSize: '1rem', gap: '10px' }}
        onClick={() => fileRef.current?.click()}
        aria-label="Open camera to capture and translate text"
      >
        <Camera size={22} aria-hidden />
        Point Camera at Text
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }}
        aria-hidden
      />

      {/* Gallery option */}
      <button
        className="btn btn-ghost btn-full"
        onClick={() => {
          if (fileRef.current) { fileRef.current.removeAttribute('capture'); fileRef.current.click(); }
        }}
        aria-label="Choose image from gallery to translate text"
      >
        🖼️ Choose from Gallery
      </button>

      {/* Preview */}
      {preview && (
        <div
          className="surface-card overflow-hidden"
          style={{ padding: 0 }}
          aria-label="Captured image preview"
        >
          <img
            src={preview}
            alt="Captured image for text translation"
            style={{ width: '100%', maxHeight: '220px', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div
          className="flex items-center justify-center gap-md surface-card"
          style={{ padding: '24px' }}
          role="status"
          aria-live="polite"
          aria-busy
        >
          <div className="spinner" aria-hidden />
          <span className="text-sm text-muted">Reading text… Translating to {lang.nativeName}</span>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <section
          className="glass-card"
          style={{ background: 'var(--accent-green-dim)', border: '1px solid var(--border-active)' }}
          aria-label="Translation result"
          role="region"
        >
          {result.extracted && (
            <div style={{ marginBottom: '12px' }}>
              <p className="text-xs text-muted" style={{ marginBottom: '4px' }}>Original text detected:</p>
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>"{result.extracted}"</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted" style={{ marginBottom: '4px' }}>Translated to {lang.flag} {lang.nativeName}:</p>
            <p style={{ fontFamily: 'Figtree', fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>{result.translated}</p>
          </div>
          <button
            className="btn btn-ghost"
            style={{ marginTop: '12px', gap: '6px' }}
            onClick={speak}
            aria-label={`Read translation aloud in ${lang.nativeName}`}
          >
            <Volume2 size={16} aria-hidden /> Read Aloud
          </button>
        </section>
      )}

      {/* Empty state instructions */}
      {!preview && !loading && (
        <div className="text-center" style={{ padding: '24px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }} aria-hidden>📸</div>
          <p className="text-sm" style={{ lineHeight: 1.6 }}>
            Point your camera at any stadium sign, food menu, or notice board.
            KickMate will detect and translate the text instantly.
          </p>
          <p className="text-xs" style={{ marginTop: '12px', opacity: 0.6 }}>Works with signs, menus, tickets, directions</p>
        </div>
      )}
    </main>
  );
}
