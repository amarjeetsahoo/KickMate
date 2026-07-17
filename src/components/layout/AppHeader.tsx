import { Moon, Sun, User, Bell } from 'lucide-react';
import type { Theme } from '../../types';

interface AppHeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  showBack?: boolean;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  hasUnread?: boolean;
  onToggleNotifications?: () => void;
}

export function AppHeader({
  theme,
  onToggleTheme,
  showBack,
  title,
  subtitle,
  onBack,
  hasUnread = false,
  onToggleNotifications
}: AppHeaderProps) {
  return (
    <header className="app-header" role="banner">
      {showBack ? (
        <button
          id="header-back-btn"
          className="btn btn-icon"
          onClick={onBack}
          aria-label="Go back"
        >
          ←
        </button>
      ) : (
        <div className="logo" aria-label="KickMate home">
          <span className="logo-ball" aria-hidden="true">⚽</span>
          <span className="logo-text">
            Kick<span>Mate</span>
          </span>
        </div>
      )}

      {title && (
        <div style={{ flex: 1 }}>
          <h1 className="h3" style={{ lineHeight: 1.1 }}>{title}</h1>
          {subtitle && <p className="text-xs text-green">{subtitle}</p>}
        </div>
      )}

      <div className="header-actions">
        {!showBack && onToggleNotifications && (
          <button
            id="header-notif-btn"
            className="btn btn-icon"
            onClick={onToggleNotifications}
            aria-label="Open notifications"
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {hasUnread && (
              <span style={{
                position: 'absolute', top: 12, right: 12,
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--accent-red)'
              }} />
            )}
          </button>
        )}
        <button
          id="header-theme-toggle"
          className="btn btn-icon"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {!showBack && (
          <button id="header-profile-btn" className="btn btn-icon" aria-label="User profile">
            <User size={18} />
          </button>
        )}
      </div>
    </header>
  );
}

