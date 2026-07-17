import { Users, BookOpen, Settings, PlaySquare, Leaf, ParkingCircle } from 'lucide-react';
import type { NavTab } from '../components/layout/BottomNav';

interface MorePageProps {
  onNavigate: (tab: NavTab) => void;
}

export function MorePage({ onNavigate }: MorePageProps) {
  const menuItems = [
    { id: 'squads', icon: <Users size={24} />, title: 'Squad Explorer', desc: 'Browse 48 nations & 1,200+ players' },
    { id: 'simulator', icon: <PlaySquare size={24} />, title: 'Match Simulator', desc: 'AI-driven match simulations' },
    { id: 'archive', icon: <BookOpen size={24} />, title: 'Historical Archive', desc: 'World Cup history from 1930-2026' },
    { id: 'parking', icon: <ParkingCircle size={24} />, title: 'Parking Assistant', desc: 'Live parking availability' },
    { id: 'eco', icon: <Leaf size={24} />, title: 'Eco Hub', desc: 'Sustainability & hydration tracking' },
    { id: 'admin', icon: <Settings size={24} />, title: 'Admin Console', desc: 'Operations & stress testing' },
  ] as const;

  return (
    <div className="page-container" style={{ paddingTop: '20px', paddingBottom: '80px' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
        gap: '16px' 
      }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="surface-card card-3d turf-glow"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '24px 16px',
              textAlign: 'center',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
            }}
          >
            <div style={{ 
              color: 'var(--accent-green)',
              background: 'var(--accent-green-dim)',
              padding: '12px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'Figtree' }}>{item.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.3 }}>{item.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
