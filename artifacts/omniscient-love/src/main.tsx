import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';

import './index.css';

/**
 * Register the service worker.
 *
 * This is what makes the app work with no internet at all - it keeps a copy
 * of every file on her phone after the first visit. Which matters enormously
 * here, because midnight is exactly when a phone decides it has no signal.
 *
 * If registration fails, the app simply works the normal way instead.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch(() => {
        // Not supported, or blocked. Nothing worth interrupting her for.
      });
  });
}

const container = document.getElementById('root');

if (!container) {
  throw new Error('No #root element found in index.html');
}

createRoot(container, {
  // Keeps handled errors out of the red development overlay.
  onCaughtError: (error, info) => {
    console.error(error, info.componentStack);
  },
}).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
