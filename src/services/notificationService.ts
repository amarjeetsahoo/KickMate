import { callGemini } from './gemini';

export interface AppNotification {
  id: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const MOCK_NOTIFICATIONS_TEMPLATES = [
  {
    type: 'warning' as const,
    title: 'Concourse Rush Warning',
    message: 'Halftime food court queues are currently long near Section 112. Try concessions near Section 120 for 10-minute shorter wait times.',
  },
  {
    type: 'alert' as const,
    title: 'Gate A Congestion',
    message: 'Gate A is experiencing high entry queues. We recommend entering through Gate C which is 80% clearer.',
  },
  {
    type: 'success' as const,
    title: 'Parking Spot Saved',
    message: 'Your vehicle in Lot A North, Bay 14 has been recorded. KickMate Navigator will guide you back post-match.',
  },
  {
    type: 'info' as const,
    title: 'Ride-Share Traffic Alert',
    message: 'Uber/Lyft pickup zones are crowded. Surge pricing is predicted to drop by 20% in 15 minutes. Sit back and enjoy the post-match show!',
  },
];

let activeNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'info',
    title: 'Welcome to the Match!',
    message: 'Enjoy the Brazil vs Argentina clash. Use KickMate for all your navigation and translation needs.',
    timestamp: new Date(Date.now() - 3600_000),
    read: false,
  },
  {
    id: 'notif-2',
    type: 'warning',
    title: 'Concourse Rush Warning',
    message: 'Halftime food court queues are currently long near Section 112. Try concessions near Section 120.',
    timestamp: new Date(Date.now() - 1800_000),
    read: false,
  },
  {
    id: 'notif-3',
    type: 'success',
    title: 'Parking Spot Saved',
    message: 'Your vehicle in Lot A North, Bay 14 has been recorded. KickMate Navigator will guide you back.',
    timestamp: new Date(Date.now() - 900_000),
    read: false,
  },
  {
    id: 'notif-4',
    type: 'alert',
    title: 'Gate A Congestion',
    message: 'Gate A is experiencing high entry queues. We recommend entering through Gate C which is 80% clearer.',
    timestamp: new Date(Date.now() - 300_000),
    read: false,
  },
  {
    id: 'notif-5',
    type: 'info',
    title: 'Live Updates Enabled',
    message: 'You will receive real-time updates for goals, cards, and VAR decisions for this match.',
    timestamp: new Date(Date.now() - 60_000),
    read: false,
  }
];

let listeners: Array<(notifications: AppNotification[]) => void> = [];

/** Maximum number of notifications stored in memory at any time */
const MAX_NOTIFICATIONS = 100;

function notifyListeners() {
  listeners.forEach((l) => l([...activeNotifications]));
}

export const notificationService = {
  getNotifications(): AppNotification[] {
    return activeNotifications;
  },

  subscribe(listener: (notifications: AppNotification[]) => void) {
    listeners.push(listener);
    listener([...activeNotifications]);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  markAsRead(id: string) {
    activeNotifications = activeNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    notifyListeners();
  },

  markAllAsRead() {
    activeNotifications = activeNotifications.map((n) => ({ ...n, read: true }));
    notifyListeners();
  },

  clearAll() {
    activeNotifications = [];
    notifyListeners();
  },

  /** Remove a single notification by id */
  dismiss(id: string) {
    activeNotifications = activeNotifications.filter((n) => n.id !== id);
    notifyListeners();
  },

  async triggerRandomNotification(stadiumName: string, targetLanguage: string) {
    const template = MOCK_NOTIFICATIONS_TEMPLATES[Math.floor(Math.random() * MOCK_NOTIFICATIONS_TEMPLATES.length)];
    
    let translatedTitle = template.title;
    let translatedMessage = template.message;

    // Use Gemini to translate notification content if language is not English
    if (targetLanguage && targetLanguage.toLowerCase() !== 'english' && targetLanguage.toLowerCase() !== 'en') {
      try {
        const prompt = `Translate this notification title and message to ${targetLanguage}. Return only JSON in the format: {"title": "...", "message": "..."}\n\nTitle: "${template.title}"\nMessage: "${template.message}"`;
        const res = await callGemini({
          prompt,
          systemPrompt: 'You are an expert translator. Return only JSON.',
        });
        const parsed = JSON.parse(res.text.replace(/```json|```/g, '').trim());
        translatedTitle = parsed.title || translatedTitle;
        translatedMessage = parsed.message || translatedMessage;
      } catch {
        // Fallback to original
      }
    }

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      type: template.type,
      title: translatedTitle,
      message: translatedMessage.replace('stadium', stadiumName),
      timestamp: new Date(),
      read: false,
    };

    activeNotifications = [newNotification, ...activeNotifications].slice(0, MAX_NOTIFICATIONS);
    notifyListeners();

    // Trigger standard browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, { body: newNotification.message });
    }
  }
};
