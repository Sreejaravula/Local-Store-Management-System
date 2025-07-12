import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Japp from './Japp';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Japp />
  </StrictMode>
);