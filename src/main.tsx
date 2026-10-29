import { Analytics } from '@vercel/analytics/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { makeGrainTile } from './ui/DrawCanvas';
import './styles.css';

// The studio's paper tooth, made once. Pencil marks outside the canvas (the
// landing's sketch, the logo) are masked with it, as `.pencil`.
document.documentElement.style.setProperty('--grain', `url(${makeGrainTile().toDataURL()})`);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
);
