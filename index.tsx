import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Mermaid.js initialization is now handled inside the App component
// to allow for dynamic theme updates.

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
