import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { useAppStore } from './store/useAppStore';
import './index.css';

// Theme engine: sync <html class="dark"> with the store. Light is the default;
// the pre-paint script in index.html applies the persisted choice before paint.
const applyTheme = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

// If nothing was persisted yet, default to light.
try {
  const raw = localStorage.getItem('devflow-store');
  const parsed = raw ? JSON.parse(raw) : null;
  if (!parsed || !parsed.state) {
    useAppStore.setState({ theme: 'light' });
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
