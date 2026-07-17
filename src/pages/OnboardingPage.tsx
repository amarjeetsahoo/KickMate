import { useState } from 'react';
import { LANGUAGES, detectBrowserLanguage } from '../data/languages';
import { STADIUMS } from '../data/stadiums';
import { storage } from '../services/storage';
import type { StadiumId } from '../types';

interface OnboardingPageProps {
  onComplete: () => void;
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [step, setStep] = useState<'language' | 'stadium' | 'consent'>('language');
  const [selectedLang, setSelectedLang] = useState(detectBrowserLanguage());
  const [selectedStadium, setSelectedStadium] = useState<StadiumId>('sofi');
  const [consents, setConsents] = useState({ camera: false, mic: false, location: false });

  const allConsented = consents.camera && consents.mic && consents.location;

  const finish = () => {
    storage.setLanguage(selectedLang);
    storage.setStadium(selectedStadium);
    storage.setOnboarded();
    onComplete();
  };

  return (
    <main
      style={{ minHeight: '100dvh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}
      aria-label="App setup"
    >
      {/* Hero banner */}
      <div
        className="hex-bg"
        style={{
          background: 'linear-gradient(180deg, rgba(0,197,94,0.12) 0%, transparent 100%)',
          padding: '48px 24px 32px', textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '12px' }} aria-hidden="true">⚽</div>
        <h1 className="h1">Welcome to KickMate</h1>
        <p className="text-secondary" style={{ marginTop: '8px', fontSize: '0.9375rem' }}>
          Your AI fan companion for FIFA World Cup 2026
        </p>
        {/* Step indicator */}
        <div className="flex justify-center gap-sm" style={{ marginTop: '20px' }} role="progressbar" aria-valuenow={step === 'language' ? 1 : step === 'stadium' ? 2 : 3} aria-valuemin={1} aria-valuemax={3} aria-label={`Step ${step === 'language' ? 1 : step === 'stadium' ? 2 : 3} of 3`}>
          {(['language', 'stadium', 'consent'] as const).map((s, i) => (
            <div
              key={s}
              style={{
                width: step === s ? 24 : 8, height: 8, borderRadius: 4,
                background: step === s || (i < ['language','stadium','consent'].indexOf(step))
                  ? 'var(--accent-green)' : 'var(--border)',
                transition: 'all 0.3s ease',
              }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        {/* Step 1: Language */}
        {step === 'language' && (
          <section aria-label="Select your language">
            <h2 className="h2" style={{ marginBottom: '8px' }}>Choose your language</h2>
            <p className="text-muted text-sm" style={{ marginBottom: '20px' }}>
              We detected <strong>{LANGUAGES.find(l => l.code === selectedLang)?.nativeName}</strong> from your device
            </p>
            <div className="grid-2" style={{ gap: '8px' }} role="listbox" aria-label="Language options">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  role="option"
                  aria-selected={selectedLang === lang.code}
                  className="surface-card"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
                    cursor: 'pointer', borderRadius: 'var(--radius-md)', textAlign: 'left',
                    border: selectedLang === lang.code ? '2px solid var(--accent-green)' : '1px solid var(--border)',
                    background: selectedLang === lang.code ? 'var(--accent-green-dim)' : 'var(--bg-card)',
                    fontFamily: 'inherit', fontSize: '0.875rem', color: 'var(--text-primary)',
                  }}
                  onClick={() => setSelectedLang(lang.code)}
                  dir={lang.rtl ? 'rtl' : 'ltr'}
                >
                  <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                  <span style={{ fontWeight: selectedLang === lang.code ? 600 : 400 }}>{lang.nativeName}</span>
                  {selectedLang === lang.code && <span className="text-green" style={{ marginLeft: 'auto' }} aria-hidden>✓</span>}
                </button>
              ))}
            </div>
            <button className="btn btn-primary btn-full" style={{ marginTop: '24px' }} onClick={() => setStep('stadium')}>
              Continue →
            </button>
          </section>
        )}

        {/* Step 2: Stadium */}
        {step === 'stadium' && (
          <section aria-label="Select your stadium">
            <h2 className="h2" style={{ marginBottom: '8px' }}>Which stadium?</h2>
            <p className="text-muted text-sm" style={{ marginBottom: '20px' }}>Select your match venue</p>
            <div className="flex flex-col gap-md" role="listbox" aria-label="Stadium options">
              {STADIUMS.map((stadium) => (
                <button
                  key={stadium.id}
                  role="option"
                  aria-selected={selectedStadium === stadium.id}
                  className="surface-card"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer',
                    border: selectedStadium === stadium.id ? '2px solid var(--accent-green)' : '1px solid var(--border)',
                    background: selectedStadium === stadium.id ? 'var(--accent-green-dim)' : 'var(--bg-card)',
                    fontFamily: 'inherit', textAlign: 'left', borderRadius: 'var(--radius-lg)',
                  }}
                  onClick={() => setSelectedStadium(stadium.id as StadiumId)}
                >
                  <div style={{ fontSize: '2.5rem' }} aria-hidden>🏟️</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontFamily: 'Figtree', color: 'var(--text-primary)' }}>{stadium.name}</div>
                    <div className="text-muted text-sm">{stadium.city}, {stadium.state}</div>
                    <div className="text-xs" style={{ color: 'var(--accent-green)', marginTop: '2px' }}>
                      Capacity: {stadium.capacity.toLocaleString()}
                    </div>
                  </div>
                  {selectedStadium === stadium.id && <span className="text-green" style={{ fontSize: '1.25rem' }} aria-hidden>✓</span>}
                </button>
              ))}
            </div>
            <div className="flex gap-md" style={{ marginTop: '24px' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep('language')}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setStep('consent')}>Continue →</button>
            </div>
          </section>
        )}

        {/* Step 3: Consent */}
        {step === 'consent' && (
          <section aria-label="Permission requests">
            <h2 className="h2" style={{ marginBottom: '8px' }}>Permissions</h2>
            <p className="text-muted text-sm" style={{ marginBottom: '20px' }}>
              KickMate needs these to work. Your data is never stored without your permission.
            </p>
            <div className="flex flex-col gap-md">
              {([
                { key: 'camera',   icon: '📷', title: 'Camera',   desc: 'For AR text translation and ticket scanning' },
                { key: 'mic',      icon: '🎤', title: 'Microphone', desc: 'For voice translation (not stored on servers)' },
                { key: 'location', icon: '📍', title: 'Location',  desc: 'For parking assistance and navigation' },
              ] as const).map(({ key, icon, title, desc }) => (
                <label
                  key={key}
                  className="surface-card"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer',
                    border: consents[key] ? '2px solid var(--accent-green)' : '1px solid var(--border)',
                    background: consents[key] ? 'var(--accent-green-dim)' : 'var(--bg-card)',
                  }}
                >
                  <span style={{ fontSize: '1.75rem' }} aria-hidden>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
                    <div className="text-muted text-xs">{desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={consents[key]}
                    onChange={() => setConsents((c) => ({ ...c, [key]: !c[key] }))}
                    aria-label={`Allow ${title}`}
                    style={{ width: 20, height: 20, accentColor: 'var(--accent-green)', cursor: 'pointer' }}
                  />
                </label>
              ))}
            </div>
            <p className="text-xs text-muted" style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', lineHeight: 1.5 }}>
              🔒 Your privacy matters. Voice audio is processed in transit only — never stored. Location is used only for navigation, never shared with third parties.
            </p>
            <div className="flex gap-md" style={{ marginTop: '24px' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep('stadium')}>← Back</button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={finish}
                disabled={!allConsented}
                aria-disabled={!allConsented}
              >
                {allConsented ? "Let's Go! ⚽" : 'Allow all to continue'}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
