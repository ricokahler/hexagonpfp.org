import React from 'react';
import { createRoot } from 'react-dom';
import { ErrorBoundary } from 'react-error-boundary';
import './index.css';
import { App } from './app';

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <ErrorBoundary fallback={<>An error occurred.</>}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
