import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { useAppStore } from './store/useAppStore';
import './index.css';

// Theme engine: sync <html> classes (dark / brutal) with the store.
const applyTheme = (theme) => {
  const resolved = theme === 'light' ? 'brutal' : theme;
  const el = document.documentElement;
  el.classList.toggle('dark', resolved === 'dark');
  el.classList.toggle('brutal', resolved === 'brutal');
};

// Default to brutal (white); migrate legacy light/dark preference.
try {
  const raw = localStorage.getItem('devflow-store');
  const parsed = raw ? JSON.parse(raw) : null;
  const stored = parsed?.state?.theme;
  if (!parsed || !parsed.state || stored === 'light' || stored === 'dark') {
    useAppStore.setState({ theme: 'brutal' });
  }
} catch (e) {
  /* noop */
}

applyTheme(useAppStore.getState().theme);
useAppStore.subscribe((state, prev) => {
  if (state.theme !== prev.theme) applyTheme(state.theme);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
