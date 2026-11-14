import { createRoot } from 'react-dom/client';
import { InternationalizationProvider } from '@astryxdesign/core';
import ptPT from '@astryxdesign/core/locales/pt-PT.generated.js';
import 'astryx-next/tema'; // primeiro: tema comum (ordem das camadas CSS)
import { aplicarAparenciaGuardada } from 'astryx-next/comum';
import App from './App.jsx';
import './app.css';

aplicarAparenciaGuardada(); // antes do primeiro render: sem piscar outro tema

createRoot(document.getElementById('root')).render(
  <InternationalizationProvider locale="pt-PT" messages={{ 'pt-PT': ptPT }}>
    <App />
  </InternationalizationProvider>,
);
