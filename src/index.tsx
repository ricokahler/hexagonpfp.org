import React from 'react';
import { createRoot } from 'react-dom';
import './index.css';
import { App } from './app';

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
