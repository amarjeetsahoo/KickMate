import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { Analytics } from '@vercel/analytics/react';

const root = document.getElementById('root')!;
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);

// Register service worker for PWA offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration is optional; app works without it
    });
  });
}
