import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './lib/i18n';

// Global error handler for regex syntax issues reported by user
window.addEventListener('error', (event) => {
  if (event.error instanceof SyntaxError && event.error.message.includes('Invalid regular expression')) {
    console.error('Caught Regex SyntaxError:', event.error.message);
    // Attempt to prevent crash if possible, or at least log clearly
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
