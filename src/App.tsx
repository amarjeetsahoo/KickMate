import { useState, Suspense, lazy, useCallback, useEffect } from 'react';
import { useTheme } from './hooks/useTheme';
import { storage, loadUserProfile } from './services/storage';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import type { NavTab } from './components/layout/BottomNav';
import { SOSButton } from './components/layout/SOSButton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { notificationService } from './services/notificationService';
import { NotificationPanel } from './components/layout/NotificationPanel';
import { STADIUM_NAMES, PAGE_TITLES, DEFAULT_STADIUM_ID, NOTIFICATION_INTERVAL_MS } from './constants';
import './styles/index.css';


// Lazy-loaded pages for code-splitting (efficiency requirement)
const LoginPage      = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const HomePage       = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const NavigatorPage  = lazy(() => import('./pages/NavigatorPage').then(m => ({ default: m.NavigatorPage })));
const TranslatorPage = lazy(() => import('./pages/TranslatorPage').then(m => ({ default: m.TranslatorPage })));
const CameraPage     = lazy(() => import('./pages/CameraPage').then(m => ({ default: m.CameraPage })));
const MatchPage      = lazy(() => import('./pages/MatchPage').then(m => ({ default: m.MatchPage })));
const ParkingPage    = lazy(() => import('./pages/ParkingPage').then(m => ({ default: m.ParkingPage })));
const SOSPage        = lazy(() => import('./pages/SOSPage').then(m => ({ default: m.SOSPage })));
const LandingPage    = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const SocialWallPage = lazy(() => import('./pages/SocialWallPage').then(m => ({ default: m.SocialWallPage })));
const FoodFinderPage = lazy(() => import('./pages/FoodFinderPage').then(m => ({ default: m.FoodFinderPage })));
const MorePage       = lazy(() => import('./pages/MorePage').then(m => ({ default: m.MorePage })));
const SquadExplorerPage = lazy(() => import('./pages/SquadExplorerPage').then(m => ({ default: m.SquadExplorerPage })));
const ArchivePage    = lazy(() => import('./pages/ArchivePage').then(m => ({ default: m.ArchivePage })));
const SimulatorPage  = lazy(() => import('./pages/SimulatorPage').then(m => ({ default: m.SimulatorPage })));
const EcoHubPage     = lazy(() => import('./pages/EcoHubPage').then(m => ({ default: m.EcoHubPage })));
const AdminConsolePage = lazy(() => import('./pages/AdminConsolePage').then(m => ({ default: m.AdminConsolePage })));

type AppState = 'login' | 'onboarding' | 'app' | 'landing';


function PageLoader() {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '60vh', flexDirection: 'column', gap: '16px',
      }}
      role="status"
      aria-label="Loading page"
    >
      <div className="spinner" aria-hidden />
      <span className="text-muted text-sm">Loading…</span>
    </div>
  );
}

function PageTitle({ tab, sosOpen }: { tab: NavTab; sosOpen: boolean }) {
  if (sosOpen) return { title: 'Emergency Help', subtitle: undefined };
  const stadiumId = storage.getStadium() || DEFAULT_STADIUM_ID;
  const base = PAGE_TITLES[tab] || { title: 'KickMate' };
  return {
    ...base,
    subtitle: tab === 'navigate' ? (STADIUM_NAMES[stadiumId] || STADIUM_NAMES[DEFAULT_STADIUM_ID]) : base.subtitle,
  };
}


export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [appState, setAppState] = useState<AppState>(() => {
    if (!storage.isLoggedIn()) return 'landing'; // Default to premium landing page
    if (!storage.isOnboarded()) return 'onboarding';
    return 'app';
  });
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [sosOpen, setSosOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Subscribe to notifications and check for unread alerts
  useEffect(() => {
    if (appState !== 'app') return;
    const unsubscribe = notificationService.subscribe((notifs) => {
      const unreadCount = notifs.filter((n) => !n.read).length;
      setHasUnread(unreadCount > 0);
    });
    return unsubscribe;
  }, [appState]);

  // Periodic simulated notification trigger for demo purposes
  useEffect(() => {
    if (appState !== 'app') return;
    
    // Ask for permission on startup
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const id = setInterval(() => {
      const stadiumId = storage.getStadium() || DEFAULT_STADIUM_ID;
      const stadiumName = STADIUM_NAMES[stadiumId] || STADIUM_NAMES[DEFAULT_STADIUM_ID];
      const language = storage.getLanguage() || 'English';
      notificationService.triggerRandomNotification(stadiumName, language);
    }, NOTIFICATION_INTERVAL_MS);

    return () => clearInterval(id);
  }, [appState]);

  const handleLogin = useCallback(() => {
    setAppState(storage.isOnboarded() ? 'app' : 'onboarding');
  }, []);

  const handleOnboarding = useCallback(() => {
    setAppState('app');
  }, []);

  const handleNavigate = useCallback((tab: NavTab) => {
    setSosOpen(false);
    setCameraOpen(false);
    setActiveTab(tab);
  }, []);

  const profile = loadUserProfile();
  const rootClasses = [

    profile?.largeText    ? 'large-text'    : '',
    profile?.highContrast ? 'high-contrast' : '',
  ].filter(Boolean).join(' ');

  if (appState === 'landing') {
    return (
      <Suspense fallback={<PageLoader />}>
        <LandingPage onStart={() => setAppState('login')} />
      </Suspense>
    );
  }

  if (appState === 'login') {
    return (
      <Suspense fallback={<PageLoader />}>
        <LoginPage onLogin={handleLogin} />
      </Suspense>
    );
  }

  if (appState === 'onboarding') {
    return (
      <Suspense fallback={<PageLoader />}>
        <OnboardingPage onComplete={handleOnboarding} />
      </Suspense>
    );
  }

  const { title, subtitle } = PageTitle({ tab: activeTab, sosOpen });
  const showBack = sosOpen || cameraOpen;

  return (
    <div className={`app-shell ${rootClasses}`} id="app">
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only"
        style={{
          position: 'absolute', top: 4, left: 4, zIndex: 9999,
          background: 'var(--accent-green)', color: '#fff',
          padding: '8px 12px', borderRadius: 'var(--radius-md)',
        }}
        onFocus={(e) => { (e.target as HTMLElement).style.clip = 'auto'; (e.target as HTMLElement).style.width = 'auto'; (e.target as HTMLElement).style.height = 'auto'; }}
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar (Only visible on viewport widths > 1024px) */}
      {!sosOpen && !cameraOpen && (
        <aside className="desktop-sidebar" role="navigation" aria-label="Desktop sidebar navigation">
          <div className="sidebar-logo">
            <span className="logo-ball" aria-hidden="true">⚽</span>
            <span>Kick<span>Mate</span></span>
          </div>
          <div className="sidebar-menu">
            {[
              { id: 'home',      icon: '🏠', label: 'Home' },
              { id: 'navigate',  icon: '🧭', label: 'Navigator' },
              { id: 'match',     icon: '⚽', label: 'Live Match' },
              { id: 'food',      icon: '🍔', label: 'Food & Merch' },
              { id: 'translate', icon: '🌐', label: 'Translator' },
              { id: 'social',    icon: '💬', label: 'Fan Wall' },
              { id: 'more',      icon: '⋯', label: 'More Features' },
            ].map((item) => (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                className={`sidebar-item${activeTab === item.id ? ' active' : ''}`}
                onClick={() => handleNavigate(item.id as NavTab)}
                aria-label={`Go to ${item.label}`}
              >
                <span className="sidebar-item-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* App Header */}
      <AppHeader
        theme={theme}
        onToggleTheme={toggleTheme}
        showBack={showBack}
        title={showBack ? (sosOpen ? 'Emergency Help' : 'Camera Translate') : (activeTab !== 'home' ? title : undefined)}
        subtitle={showBack ? undefined : (activeTab !== 'home' ? subtitle : undefined)}
        onBack={() => { setSosOpen(false); setCameraOpen(false); }}
        hasUnread={hasUnread}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
        onProfileClick={() => {
          storage.logout();
          setAppState('landing');
        }}
      />

      {/* Main Content */}
      <div className="page-content" id="main-content" tabIndex={-1}>
        <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          {sosOpen ? (
            <SOSPage onClose={() => setSosOpen(false)} />
          ) : cameraOpen ? (
            <CameraPage />
          ) : activeTab === 'home' ? (
            <HomePage onNavigate={(tab) => {
              if (tab === 'translate') { setCameraOpen(true); }
              else handleNavigate(tab);
            }} />
          ) : activeTab === 'navigate' ? (
            <NavigatorPage />
          ) : activeTab === 'translate' ? (
            <TranslatorPage />
          ) : activeTab === 'match' ? (
            <MatchPage />
          ) : activeTab === 'more' ? (
            <MorePage onNavigate={handleNavigate} />
          ) : activeTab === 'parking' ? (
            <ParkingPage onNavigateToSeat={() => handleNavigate('navigate')} />
          ) : activeTab === 'squads' ? (
            <SquadExplorerPage />
          ) : activeTab === 'archive' ? (
            <ArchivePage />
          ) : activeTab === 'simulator' ? (
            <SimulatorPage />
          ) : activeTab === 'eco' ? (
            <EcoHubPage />
          ) : activeTab === 'admin' ? (
            <AdminConsolePage />
          ) : activeTab === 'social' ? (
            <SocialWallPage />
          ) : activeTab === 'food' ? (
            <FoodFinderPage />
          ) : null}
        </Suspense>
        </ErrorBoundary>
      </div>

      {/* Smart Alerts overlay */}
      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}

      {/* Persistent SOS Button (never inside a specific page) */}
      {!sosOpen && (
        <SOSButton onClick={() => { setSosOpen(true); setCameraOpen(false); }} />
      )}

      {/* Bottom Navigation (Hidden on desktops) */}
      <BottomNav active={activeTab} onChange={handleNavigate} />
    </div>
  );
}
