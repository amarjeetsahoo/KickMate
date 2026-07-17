import { useState, type FormEvent } from 'react';
import { storage } from '../services/storage';

interface LoginPageProps {
  onLogin: () => void;
}

const DEMO_CREDENTIALS = { email: 'demo@kickmate.app', password: 'demo123' };

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic input validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // Simulate auth

    if (
      email.toLowerCase() === DEMO_CREDENTIALS.email &&
      password === DEMO_CREDENTIALS.password
    ) {
      storage.setLoggedIn(true);
      onLogin();
    } else {
      setError('Invalid credentials. Use demo@kickmate.app / demo123');
    }
    setLoading(false);
  };

  const quickDemo = () => {
    storage.setLoggedIn(true);
    onLogin();
  };

  return (
    <main
      className="flex flex-col items-center justify-center"
      style={{ minHeight: '100dvh', padding: '24px', background: 'var(--bg-primary)' }}
      aria-label="Login screen"
    >
      {/* Hero */}
      <div className="text-center" style={{ marginBottom: '48px' }}>
        <div
          style={{
            fontSize: '5rem', marginBottom: '16px',
            filter: 'drop-shadow(0 0 24px rgba(0,197,94,0.4))',
            animation: 'fade-in 0.6s ease-out',
          }}
          aria-hidden="true"
        >
          ⚽
        </div>
        <h1 className="h1" style={{ fontFamily: 'Figtree', fontWeight: 800, marginBottom: '8px' }}>
          Kick<span className="text-green">Mate</span>
        </h1>
        <p className="text-secondary" style={{ fontSize: '0.9375rem' }}>
          Your AI companion for FIFA World Cup 2026
        </p>
        <div
          className="badge badge-gold"
          style={{ margin: '12px auto 0', display: 'inline-flex' }}
          aria-label="Official FIFA World Cup 2026 fan app"
        >
          🏆 FIFA World Cup 2026
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-md"
        style={{ width: '100%', maxWidth: '340px' }}
        aria-label="Login form"
        noValidate
      >
        <div>
          <label htmlFor="email" className="text-sm text-secondary" style={{ display: 'block', marginBottom: '6px' }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="demo@kickmate.app"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            aria-required="true"
            aria-describedby={error ? 'login-error' : undefined}
            aria-invalid={!!error}
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm text-secondary" style={{ display: 'block', marginBottom: '6px' }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="demo123"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            aria-required="true"
          />
        </div>

        {error && (
          <p id="login-error" role="alert" className="text-red text-sm" style={{ padding: '8px 12px', background: 'var(--accent-red-dim)', borderRadius: 'var(--radius-md)' }}>
            ⚠️ {error}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} aria-hidden="true" /> Signing in…</> : 'Sign In'}
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-full"
          onClick={quickDemo}
        >
          ⚡ Quick Demo Login
        </button>
      </form>

      <p className="text-xs text-muted" style={{ marginTop: '24px', textAlign: 'center' }}>
        Demo credentials: demo@kickmate.app / demo123
      </p>
    </main>
  );
}
