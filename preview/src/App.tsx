import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { Icon } from './icons.tsx';
import { PAIRS, ratio } from './contrast.ts';

// The page state lives in the URL (?d=…&layer=…&mode=…) so a screenshot script can open any combination.
const DIRECTIONS = [
  { id: 'paper', name: 'Paper & Ink' },
  { id: 'instrument', name: 'Instrument v2' },
  { id: 'soft', name: 'Soft (dropped)' },
  { id: 'synthesis', name: 'Synthesis' },
] as const;
const LAYERS = [
  { id: 'core', name: 'Core' },
  { id: 'tool', name: 'Tool' },
  { id: 'playful', name: 'Playful' },
] as const;
const CASES = [
  { id: 'auto', name: 'Auto', keep: true },
  { id: 'sentence', name: 'Aa', keep: true },
  { id: 'lower', name: 'aa', keep: true },
] as const;
const MODES = [
  { id: 'system', name: 'System' },
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' },
] as const;

type Option = { id: string; name: string; keep?: boolean };

function useParam(key: string, fallback: string): [string, (v: string) => void] {
  const [value, setValue] = useState(new URLSearchParams(location.search).get(key) ?? fallback);
  const set = (v: string) => {
    const params = new URLSearchParams(location.search);
    params.set(key, v);
    history.replaceState(null, '', `?${params}`);
    setValue(v);
  };
  return [value, set];
}

// The selection is one outline that slides to the picked option. CSS draws and animates it;
// this only measures where it goes (the job @beastui/preact will do). Without JS, the picked
// option draws its own outline, so the control still reads right.
function Seg({ label, options, value, onChange }: { label: string; options: readonly Option[]; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const place = () => {
      const picked = root.querySelector<HTMLElement>('button[aria-pressed="true"]');
      if (!picked) return;
      // Sub-pixel rects, not offsetLeft/offsetWidth (they round, and the outline would be off by a fraction).
      const box = root.getBoundingClientRect();
      const r = picked.getBoundingClientRect();
      root.style.setProperty('--seg-x', `${r.left - box.left - root.clientLeft}px`);
      root.style.setProperty('--seg-w', `${r.width}px`);
      root.dataset.thumb = '';
    };
    place();
    // Widths change with fonts, the interface case and the layer, so follow the buttons' size.
    const observer = new ResizeObserver(place);
    root.querySelectorAll('button').forEach((b) => observer.observe(b));
    return () => observer.disconnect();
  }, [value, options]);
  return (
    <div class="b-seg" role="group" aria-label={label} ref={ref}>
      <span class="b-seg__thumb" aria-hidden="true" />
      {options.map((o) => (
        <button type="button" class={o.keep ? 'b-keep' : undefined} aria-pressed={o.id === value} onClick={() => onChange(o.id)}>
          {o.name}
        </button>
      ))}
    </div>
  );
}

export function App() {
  const [direction, setDirection] = useParam('d', 'paper');
  const [layer, setLayer] = useParam('layer', 'core');
  const [mode, setMode] = useParam('mode', 'system');
  const [textCase, setTextCase] = useParam('case', 'auto');

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.direction = direction;
    root.dataset.layer = direction === 'synthesis' ? layer : 'core';
    root.dataset.mode = mode;
    root.dataset.case = textCase;
  }, [direction, layer, mode, textCase]);

  return (
    <>
      <header class="pv-bar">
        <span class="pv-mark">beastui</span>
        <span class="b-label">Phase 3 preview · round 2</span>
        <div class="pv-controls">
          <Seg label="Direction" options={DIRECTIONS} value={direction} onChange={setDirection} />
          {direction === 'synthesis' && <Seg label="Layer" options={LAYERS} value={layer} onChange={setLayer} />}
          <Seg label="Interface case" options={CASES} value={textCase} onChange={setTextCase} />
          <Seg label="Mode" options={MODES} value={mode} onChange={setMode} />
        </div>
      </header>

      <main class="pv-main">
        <section class="pv-card" aria-labelledby="s-controls">
          <h2 id="s-controls" class="b-label">1 · Buttons and field</h2>
          <Controls />
        </section>

        <section class="pv-card pv-wide" aria-labelledby="s-table">
          <h2 id="s-table" class="b-label">2 · Table (Masterz)</h2>
          <TrackTable />
        </section>

        <section class="pv-card" aria-labelledby="s-drawer">
          <h2 id="s-drawer" class="b-label">3 · Drawer (Masterz settings)</h2>
          <div class="stage">
            <TrackTable compact />
            <Drawer />
          </div>
        </section>

        <section class="pv-card" aria-labelledby="s-veil">
          <h2 id="s-veil" class="b-label">4 · Progress and veil (long job)</h2>
          <div class="stage">
            <TrackTable compact />
            <Veil />
          </div>
        </section>

        <section class="pv-card" aria-labelledby="s-play">
          <h2 id="s-play" class="b-label">5 · Playful sample (Attaque Défense)</h2>
          <Playful />
        </section>

        <section class="pv-card" aria-labelledby="s-game">
          <h2 id="s-game" class="b-label">6 · Game table (Attaque Défense)</h2>
          <GameTable />
        </section>

        <section class="pv-card" aria-labelledby="s-choices">
          <h2 id="s-choices" class="b-label">7 · Tabs, switch, radio, slider</h2>
          <Choices />
        </section>

        <section class="pv-card" aria-labelledby="s-float">
          <h2 id="s-float" class="b-label">8 · Floating layers: menu, tooltip, toast</h2>
          <Floating />
        </section>

        <section class="pv-card" aria-labelledby="s-dialog">
          <h2 id="s-dialog" class="b-label">9 · Dialog and empty state</h2>
          <DialogAndEmpty />
        </section>

        <section class="pv-card pv-wide" aria-labelledby="s-contrast">
          <h2 id="s-contrast" class="b-label">Contrast, computed live</h2>
          <Contrast deps={`${direction}/${layer}/${mode}`} />
        </section>
      </main>
    </>
  );
}

function Controls() {
  const [filter, setFilter] = useState('all');
  return (
    <div class="pv-stack">
      <div class="pv-row">
        <button class="b-btn" data-variant="primary" type="button">
          Master 3
        </button>
        <button class="b-btn" data-variant="secondary" type="button">
          Analyse all
        </button>
        <button class="b-btn" data-variant="quiet" type="button">
          Clear
        </button>
        <button class="b-btn" data-variant="danger" type="button">
          Replace
        </button>
        <button class="b-btn" data-variant="secondary" data-icon type="button" aria-label="Settings">
          <Icon name="sliders" />
        </button>
        <button class="b-btn" data-variant="secondary" type="button" disabled>
          Undo
        </button>
      </div>
      <Seg
        label="Filter"
        value={filter}
        onChange={setFilter}
        options={[
          { id: 'all', name: 'All (16)' },
          { id: 'ready', name: 'Ready (7)' },
          { id: 'todo', name: 'To do (4)' },
          { id: 'done', name: 'Mastered (3)' },
        ]}
      />
      <div class="pv-grid2">
        <label class="b-field">
          <span class="b-field__label">Crate name</span>
          <input class="b-input" placeholder="e.g. Warm-up" />
          <span class="b-field__hint">Shown in Serato.</span>
        </label>
        <label class="b-field">
          <span class="b-field__label">Loudness target</span>
          <span class="b-input-group">
            <input class="b-input b-num" value="-4" aria-invalid="true" aria-describedby="err-lufs" />
            <span class="b-label b-keep">LUFS</span>
          </span>
          <span class="b-field__error" id="err-lufs">
            <Icon name="alert" />
            Between −14 and −6.
          </span>
        </label>
      </div>
    </div>
  );
}

const TRACKS = [
  { title: 'Lumen Drift - Afterglow (Extended Mix)', file: ['MP3 320'], lufs: -12.4, at: 30, punch: 10.8, state: 'todo', status: 'Bring up' },
  { title: 'Nadia Okafor - Paper Moons', file: ['WAV'], lufs: -9.3, at: 55, punch: 10.8, state: 'review', status: 'In range', selected: true },
  { title: 'The Velvet Orbit - Slow Signal', file: ['MP3 320', 'Dense master'], lufs: -6.8, at: 80, punch: 6.2, state: 'progress', status: (
      <>
        Turn down −2.2 <span class="b-keep">dB</span>
      </>
    ) },
  { title: 'Kasper Lind - Night Market', file: ['MP3 192', 'Low bitrate'], lufs: -13.1, at: 22, punch: 10.8, state: 'error', status: 'Re-download', danger: true },
  { title: 'Sol Mirage - Copper Sky (Dub)', file: ['MP3 320'], lufs: -9.0, at: 60, punch: 9.4, state: 'done', status: 'Mastered: −12.1 → −9.0' },
  { title: 'Halcyon Tape - Low Tide', file: ['MP3 320', 'Clipped'], lufs: -5.9, at: 92, punch: 6.2, state: 'done', status: 'Loud, kept' },
];

function TrackTable({ compact = false }: { compact?: boolean }) {
  const rows = compact ? TRACKS.slice(0, 5) : TRACKS;
  return (
    <div class="pv-scroll" inert={compact}>
      <table class="b-table">
        <thead>
          <tr>
            <th aria-label="Select" />
            <th class="b-label">Track</th>
            {!compact && <th class="b-label">File</th>}
            <th class="b-label" data-num>
              Loudness
            </th>
            {!compact && <th class="b-label" aria-label="Scale" />}
            {!compact && (
              <th class="b-label" data-num>
                Punch
              </th>
            )}
            <th class="b-label">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr aria-selected={t.selected ? 'true' : undefined}>
              <td>
                <input class="b-check" type="checkbox" checked={t.selected} aria-label={`Select ${t.title}`} />
              </td>
              <td class="b-cell-title">{t.title}</td>
              {!compact && (
                <td>
                  <span class="b-cell-tags">
                    {t.file.map((f, i) => (
                      <span class={i === 0 ? 'b-tag b-keep' : 'b-tag'} data-tone={i > 0 && t.danger ? 'danger' : undefined}>
                        {f}
                      </span>
                    ))}
                  </span>
                </td>
              )}
              <td data-num>{t.lufs.toFixed(1).replace('-', '−')}</td>
              {!compact && (
                <td>
                  <span class="b-scale" aria-hidden="true">
                    <span class="b-scale__dot" style={{ '--at': t.at }} />
                  </span>
                </td>
              )}
              {!compact && <td data-num>{t.punch.toFixed(1)}</td>}
              <td>
                <span class="b-state" data-tone={t.danger ? 'danger' : undefined}>
                  <span class="b-status" data-state={t.state} aria-hidden="true" />
                  <span>{t.status}</span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Drawer() {
  const [format, setFormat] = useState('source');
  return (
    <aside class="b-drawer" aria-labelledby="drawer-title">
      <div class="b-drawer__head">
        <h3 class="b-drawer__title" id="drawer-title">
          Target
        </h3>
        <button class="b-btn" data-variant="quiet" data-icon type="button" aria-label="Close">
          <Icon name="x" />
        </button>
      </div>
      <div class="b-drawer__body">
        <label class="b-field">
          <span class="b-field__label">Integrated loudness</span>
          <span class="b-input-group">
            <input class="b-input b-num" value="−9.0" />
            <span class="b-label b-keep">LUFS</span>
          </span>
        </label>
        <label class="b-field">
          <span class="b-field__label">True peak ceiling</span>
          <span class="b-input-group">
            <input class="b-input b-num" value="−1.0" />
            <span class="b-label b-keep">dBTP</span>
          </span>
        </label>
        <div class="b-field">
          <span class="b-field__label">Output format</span>
          <Seg
            label="Output format"
            value={format}
            onChange={setFormat}
            options={[
              { id: 'source', name: 'Keep source' },
              { id: 'wav', name: 'WAV', keep: true },
              { id: 'mp3', name: 'MP3 320', keep: true },
            ]}
          />
        </div>
        <dl class="b-props">
          <dt>Analysed</dt>
          <dd class="b-num">87 tracks</dd>
          <dt>Last run</dt>
          <dd>2 min ago</dd>
        </dl>
      </div>
      <div class="b-drawer__foot">
        <button class="b-btn" data-variant="quiet" type="button">
          Cancel
        </button>
        <button class="b-btn" data-variant="primary" type="button">
          Save
        </button>
      </div>
    </aside>
  );
}

const STAGES = [
  { name: 'Analyse', state: 'done' },
  { name: 'Master', state: 'progress', current: true },
  { name: 'Check', state: 'todo' },
  { name: 'Write', state: 'todo' },
];

function Veil() {
  return (
    <div class="b-veil">
      <div class="b-veil__panel" role="status" aria-live="polite">
        <div class="b-veil__head">
          <h3 class="b-veil__title">Mastering</h3>
          <span class="b-num">42%</span>
        </div>
        <div class="b-progress" role="progressbar" aria-valuenow={42} aria-valuemin={0} aria-valuemax={100} aria-label="Mastering">
          <div class="b-progress__fill" style={{ '--value': 42 }} />
        </div>
        <div class="b-progress__ticks" style={{ '--n': STAGES.length }} aria-hidden="true" />
        <ol class="b-steps" style={{ '--n': STAGES.length }}>
          {STAGES.map((s) => (
            <li aria-current={s.current ? 'step' : undefined}>
              <span class="b-status" data-state={s.state} aria-hidden="true" />
              {s.name}
            </li>
          ))}
        </ol>
        <div class="b-veil__meta">
          <span class="b-num">5 / 12 · Halcyon Tape - Low Tide.mp3</span>
          <span class="b-num">01:48 · ~2 min left</span>
        </div>
        <div class="b-veil__foot">
          <span>Keep Serato closed until it ends.</span>
          <button class="b-btn" data-variant="secondary" type="button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Playful() {
  const [energy, setEnergy] = useState(70);
  return (
    <div class="pv-stack">
      <div class="pv-row">
        <span class="b-turn">
          <span class="b-turn__dot" aria-hidden="true" />
          Your turn
        </span>
        <span class="b-label">Pick a player · 0:12</span>
      </div>
      <div class="b-meter">
        <div class="b-meter__head">
          <span class="b-field__label">Energy</span>
          <span class="b-num">{energy / 10} / 10</span>
        </div>
        <div class="b-meter__track" role="meter" aria-valuenow={energy / 10} aria-valuemin={0} aria-valuemax={10} aria-label="Energy">
          <div class="b-meter__fill" style={{ '--value': energy }} />
        </div>
      </div>
      <div class="pv-row">
        <div class="b-badge" role="img" aria-label="Rank 7">
          7
        </div>
        <div>
          <div class="b-field__label">Rank 7 · Strategist</div>
          <div class="b-field__hint">3 wins to rank 8</div>
        </div>
        <button class="b-btn" data-variant="primary" type="button" style={{ marginLeft: 'auto' }} onClick={() => setEnergy(energy >= 100 ? 20 : energy + 20)}>
          <Icon name="plus" />
          Charge
        </button>
      </div>
    </div>
  );
}

function Contrast({ deps }: { deps: string }) {
  const [rows, setRows] = useState<{ what: string; value: number; min: number }[]>([]);
  useEffect(() => {
    // Wait a frame so the new data attributes have restyled the page.
    const id = requestAnimationFrame(() => setRows(PAIRS.map((p) => ({ what: p.what, min: p.min, value: ratio(p.fg, p.bg) }))));
    return () => cancelAnimationFrame(id);
  }, [deps]);
  return (
    <table class="pv-contrast" id="contrast">
      <tbody>
        {rows.map((r) => {
          const ok = r.min === 0 || r.value >= r.min;
          return (
            <tr data-ok={ok}>
              <td>{r.what}</td>
              <td class="b-num">{r.value.toFixed(2)}</td>
              <td class="b-num">{r.min ? `≥ ${r.min}` : 'info'}</td>
              <td>{r.min === 0 ? '' : ok ? '✓' : '✗ fails'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

type Card = { rank: string; suit: '♠' | '♣' | '♥' | '♦' };
const red = (c: Card) => (c.suit === '♥' || c.suit === '♦' ? 'red' : undefined);

function PlayingCard({ card, i = 0, picked, onPick }: { card: Card; i?: number; picked?: boolean; onPick?: () => void }) {
  const label = `${card.rank} of ${{ '♠': 'spades', '♣': 'clubs', '♥': 'hearts', '♦': 'diamonds' }[card.suit]}`;
  const face = (
    <>
      <span>{card.rank}</span>
      <span class="b-card__suit" aria-hidden="true">
        {card.suit}
      </span>
    </>
  );
  return onPick ? (
    <button class="b-card" type="button" data-suit={red(card)} style={{ '--i': i }} aria-pressed={picked} aria-label={label} onClick={onPick}>
      {face}
    </button>
  ) : (
    <span class="b-card" data-suit={red(card)} style={{ '--i': i }} role="img" aria-label={label}>
      {face}
    </span>
  );
}

function GameTable() {
  const [deal, setDeal] = useState(0);
  const [picked, setPicked] = useState(1);
  const hand: Card[] = [
    { rank: '8', suit: '♦' },
    { rank: '10', suit: '♠' },
    { rank: '4', suit: '♦' },
  ];
  return (
    <div class="b-game" key={deal}>
      <div class="b-seats">
        <div class="b-seat">
          <span class="b-seat__name b-keep">Elsa</span>
          <PlayingCard card={{ rank: '5', suit: '♣' }} />
        </div>
        <div class="b-seat">
          <span class="b-seat__name b-keep">Dorian</span>
          <PlayingCard card={{ rank: '3', suit: '♦' }} i={1} />
        </div>
      </div>
      <div class="b-pile">
        <span class="b-card" data-back aria-label="Deck" role="img" />
        <PlayingCard card={{ rank: '2', suit: '♦' }} i={2} />
      </div>
      <span class="b-turn">
        <span class="b-turn__dot" aria-hidden="true" />
        Your turn
      </span>
      <div class="b-hand" role="group" aria-label="Your hand">
        {hand.map((c, i) => (
          <PlayingCard card={c} i={i + 3} picked={picked === i} onPick={() => setPicked(i)} />
        ))}
      </div>
      <button class="b-btn" data-variant="secondary" type="button" onClick={() => setDeal(deal + 1)}>
        Deal again
      </button>
    </div>
  );
}

function Choices() {
  const [tab, setTab] = useState('loudness');
  const [on, setOn] = useState(true);
  const [mode, setMode] = useState('club');
  const [target, setTarget] = useState(-9);
  return (
    <div class="pv-stack">
      <div class="b-tabs" role="tablist" aria-label="Track details">
        {['Overview', 'Loudness', 'History'].map((t) => (
          <button class="b-tab" role="tab" type="button" aria-selected={tab === t.toLowerCase()} onClick={() => setTab(t.toLowerCase())}>
            {t}
          </button>
        ))}
      </div>
      <label class="b-choice">
        <input class="b-switch" type="checkbox" role="switch" checked={on} onChange={() => setOn(!on)} />
        <span>
          Keep <span class="b-keep">Serato</span> closed while mastering
        </span>
      </label>
      <fieldset class="b-choices">
        <legend class="b-field__label">Profile</legend>
        {[
          { id: 'club', name: 'Club', hint: '−9 LUFS' },
          { id: 'stream', name: 'Streaming', hint: '−14 LUFS' },
          { id: 'radio', name: 'Radio', hint: '−23 LUFS' },
        ].map((o) => (
          <label class="b-choice">
            <input class="b-radio" type="radio" name="profile" checked={mode === o.id} onChange={() => setMode(o.id)} />
            <span>{o.name}</span>
            <span class="b-label b-keep b-num">{o.hint}</span>
          </label>
        ))}
      </fieldset>
      <label class="b-field">
        <span class="b-veil__meta">
          <span class="b-field__label">Loudness target</span>
          <span class="b-num">
            {String(target.toFixed(1)).replace('-', '−')} <span class="b-keep">LUFS</span>
          </span>
        </span>
        <input
          class="b-slider"
          type="range"
          min={-16}
          max={-6}
          step={0.5}
          value={target}
          style={{ '--v': target, '--min': -16, '--max': -6 }}
          onInput={(e) => setTarget(Number((e.target as HTMLInputElement).value))}
        />
      </label>
    </div>
  );
}

function Floating() {
  const [round, setRound] = useState(0);
  return (
    <div class="stage pv-float">
      <div class="pv-float__menu">
        <button class="b-select" type="button" aria-haspopup="menu" aria-expanded="true">
          <span>Sort: loudness</span>
          <Icon name="chevron" />
        </button>
        <ul class="b-menu" role="menu" aria-label="Sort">
          <li class="b-menu__item" role="menuitemradio" aria-checked="false">
            <Icon name="check" />
            Name
          </li>
          <li class="b-menu__item" role="menuitemradio" aria-checked="true" data-active>
            <Icon name="check" />
            Loudness
            <kbd class="b-kbd">L</kbd>
          </li>
          <li class="b-menu__item" role="menuitemradio" aria-checked="false">
            <Icon name="check" />
            Date added
          </li>
          <li class="b-menu__sep" role="separator" />
          <li class="b-menu__item" role="menuitem" data-tone="danger">
            <Icon name="check" />
            Remove from crate
          </li>
        </ul>
      </div>
      <div class="pv-float__tip">
        <span class="b-tooltip" role="tooltip">
          Master selected <kbd class="b-kbd">M</kbd>
        </span>
        <button class="b-btn" data-variant="primary" type="button" onClick={() => setRound(round + 1)}>
          <Icon name="play" />
          Master 3
        </button>
      </div>
      <div class="b-toasts" key={round} role="status">
        <div class="b-toast" style={{ '--i': 0 }}>
          <Icon name="check" />
          <span class="b-toast__text">3 tracks mastered</span>
          <button class="b-btn" data-variant="quiet" type="button">
            Undo
          </button>
        </div>
        <div class="b-toast" data-tone="danger" style={{ '--i': 1 }}>
          <Icon name="alert" />
          <span class="b-toast__text">1 file missing</span>
          <button class="b-btn" data-variant="quiet" type="button">
            Show
          </button>
        </div>
      </div>
    </div>
  );
}

function DialogAndEmpty() {
  return (
    <div class="pv-stack">
      <div class="stage pv-short">
        <div class="b-veil">
          <div class="b-dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
            <h3 class="b-dialog__title" id="dlg-title">
              Replace 3 files?
            </h3>
            <p>The originals move to the trash. Serato keeps its cue points.</p>
            <div class="b-dialog__actions">
              <button class="b-btn" data-variant="quiet" type="button">
                Cancel
              </button>
              <button class="b-btn" data-variant="danger" type="button">
                Replace
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="b-empty">
        <Icon name="plus" />
        <h3 class="b-empty__title">No tracks yet</h3>
        <p>Pick a crate on the left, or add a folder. Nothing is changed until you master.</p>
        <button class="b-btn" data-variant="primary" type="button">
          Add a folder
        </button>
      </div>
    </div>
  );
}
