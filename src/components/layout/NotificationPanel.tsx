import { useEffect, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';

import { notificationService, type AppNotification } from '../../services/notificationService';

interface NotificationPanelProps {
  onClose: () => void;
}

const TYPE_COLORS = {
  info: 'var(--accent-blue)',
  warning: 'var(--accent-amber)',
  alert: 'var(--accent-red)',
  success: 'var(--accent-green)',
};

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    return notificationService.subscribe((notifs) => {
      setNotifications(notifs);
    });
  }, []);

  const formatTimestamp = (date: Date) => {
    const min = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (min < 1) return 'Just now';
    if (min < 60) return `${min}m ago`;
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)', zIndex: 999, backdropFilter: 'blur(2px)'
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Popup Modal */}
      <div
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '90%', maxWidth: '360px', maxHeight: '80vh',
          background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)', zIndex: 1000, display: 'flex', flexDirection: 'column'
        }}
        role="dialog"
        aria-label="Notification center"
      >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} color="var(--accent-green)" />
          <h3 className="h3" style={{ margin: 0 }}>Smart Alerts</h3>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {notifications.length > 0 && (
            <>
              <button
                className="btn btn-icon"
                style={{ width: '32px', height: '32px' }}
                onClick={() => notificationService.clearAll()}
                title="Clear all notifications"
                aria-label="Clear all notifications"
              >
                <span style={{ fontSize: '14px' }}>🗑️</span>
              </button>
              <button
                className="btn btn-icon"
                style={{ width: '32px', height: '32px' }}
                onClick={() => notificationService.markAllAsRead()}
                title="Mark all as read"
                aria-label="Mark all notifications as read"
              >
                <Check size={14} />
              </button>
            </>
          )}
          <button
            className="btn btn-icon"
            style={{ width: '32px', height: '32px' }}
            onClick={onClose}
            title="Close notifications"
            aria-label="Close notification panel"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px' }} role="log" aria-live="polite">
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p className="text-sm">No new notifications</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              style={{
                display: 'flex', gap: '12px', padding: '12px',
                background: notif.read ? 'transparent' : 'var(--bg-glass)',
                borderBottom: '1px solid var(--border)',
                borderLeft: `3px solid ${TYPE_COLORS[notif.type]}`,
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                marginBottom: '8px', position: 'relative'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {notif.title}
                  </span>
                  <span className="text-xs text-muted">
                    {formatTimestamp(notif.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-secondary" style={{ lineHeight: 1.4 }}>
                  {notif.message}
                </p>
              </div>
              {!notif.read && (
                <button
                  style={{
                    position: 'absolute', right: 4, bottom: 4,
                    width: 16, height: 16, borderRadius: '50%',
                    background: 'var(--accent-green-dim)', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => notificationService.markAsRead(notif.id)}
                  aria-label="Mark single notification as read"
                >
                  <Check size={10} color="var(--accent-green)" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
}
