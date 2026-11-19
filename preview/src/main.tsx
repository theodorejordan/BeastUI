// Fonts are self-hosted, latin subset only, like AD and Masterz (audit §3).
import '@fontsource/inter-tight/latin-400.css';
import '@fontsource/inter-tight/latin-500.css';
import '@fontsource/inter-tight/latin-600.css';
import '@fontsource/outfit/latin-300.css';
import '@fontsource/outfit/latin-500.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';

// Layer order first: whatever the import order below, this fixes the cascade (research §4).
import './layers.css';
import './directions/paper.css';
import './directions/instrument.css';
import './directions/soft.css';
import './directions/synthesis.css';
import './components.css';
import './preview.css';

import { render } from 'preact';
import { App } from './App.tsx';

render(<App />, document.getElementById('app')!);
