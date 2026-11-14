import { createRoot } from 'react-dom/client';
import { Theme } from '@astryxdesign/core/theme';
import { InternationalizationProvider } from '@astryxdesign/core';
import ptPT from '@astryxdesign/core/locales/pt-PT.generated.js';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/fonts.css';
import '@astryxdesign/theme-neutral/theme.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <InternationalizationProvider locale="pt-PT" messages={{ 'pt-PT': ptPT }}>
    <Theme theme={neutralTheme}>
      <App />
    </Theme>
  </InternationalizationProvider>,
);
