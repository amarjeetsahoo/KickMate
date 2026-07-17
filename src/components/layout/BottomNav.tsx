import { Home, Compass, Globe, MoreHorizontal } from 'lucide-react';

export type NavTab = 'home' | 'navigate' | 'translate' | 'match' | 'more' | 'social' | 'food' | 'parking' | 'squads' | 'archive' | 'simulator' | 'eco' | 'admin';

interface BottomNavProps {

  active: NavTab;
  onChange: (tab: NavTab) => void;
}

const NAV_ITEMS: Array<{ id: NavTab; icon: React.ReactNode; label: string; ariaLabel: string }> = [
  { id: 'home',      icon: <Home size={20} />,          label: 'Home',      ariaLabel: 'Go to home' },
  { id: 'navigate',  icon: <Compass size={20} />,       label: 'Navigate',  ariaLabel: 'Open stadium navigator' },
  { id: 'translate', icon: <Globe size={20} />,         label: 'Translate', ariaLabel: 'Open conversation translator' },
  { id: 'match',     icon: <span aria-hidden>⚽</span>, label: 'Match',     ariaLabel: 'View live match' },
  { id: 'more',      icon: <MoreHorizontal size={20} />, label: 'More',     ariaLabel: 'More options' },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          id={`nav-tab-${item.id}`}
          className={`nav-item${active === item.id ? ' active' : ''}`}
          onClick={() => onChange(item.id)}
          aria-label={item.ariaLabel}
          aria-current={active === item.id ? 'page' : undefined}
        >
          <span className="nav-icon" aria-hidden="true">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
