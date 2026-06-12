import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CAR_MODELS, CAR_MODELS_BY_CATEGORY, DEFAULT_CAR_ID, type CarModel } from '@/data/cars';
import type { WrapConfig, EnvironmentMode } from './ThreeScene';

// ── Design tokens ──────────────────────────────────────────────────────────────

const T = {
  bg:            'rgba(10, 10, 15, 0.92)',
  bgElevated:    'rgba(14, 14, 20, 0.98)',
  border:        'rgba(255,255,255,0.08)',
  borderHi:      'rgba(255,255,255,0.15)',
  accent:        '#3b82f6',
  accentDim:     'rgba(59,130,246,0.14)',
  accentBorder:  'rgba(59,130,246,0.45)',
  accentText:    '#93c5fd',
  text:          '#e2e8f0',
  textSub:       '#94a3b8',
  textMuted:     '#475569',
  success:       '#22c55e',
  successDim:    'rgba(34,197,94,0.14)',
  successBorder: 'rgba(34,197,94,0.45)',
  successText:   '#86efac',
  warning:       '#f59e0b',
  divider:       'rgba(255,255,255,0.06)',
  radius:        '10px',
  font:          "'Inter', system-ui, -apple-system, sans-serif",
};

// ── CSS (injected once) ───────────────────────────────────────────────────────

const STYLES = `
.wp-panel {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.12) transparent;
}
.wp-panel::-webkit-scrollbar { width: 3px; }
.wp-panel::-webkit-scrollbar-track { background: transparent; }
.wp-panel::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.12);
  border-radius: 99px;
}

.wp-list {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}
.wp-list::-webkit-scrollbar { width: 3px; }
.wp-list::-webkit-scrollbar-track { background: transparent; }
.wp-list::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 99px;
}

.wp-btn {
  transition: filter 0.14s, border-color 0.14s;
  cursor: pointer;
}
.wp-btn:hover:not(:disabled) { filter: brightness(1.22); }
.wp-btn:active:not(:disabled) { filter: brightness(0.88); }
.wp-btn:disabled { opacity: 0.42; cursor: not-allowed; }

.wp-env {
  transition: background 0.16s, border-color 0.16s, color 0.16s;
  cursor: pointer;
}
.wp-env:hover { filter: brightness(1.25); }

.wp-car {
  transition: background 0.1s;
  cursor: pointer;
}
.wp-car:hover { background: rgba(59,130,246,0.1) !important; }
.wp-car:active { background: rgba(59,130,246,0.2) !important; }

.wp-trigger {
  transition: border-color 0.14s, filter 0.14s;
  cursor: pointer;
}
.wp-trigger:hover:not(:disabled) { border-color: rgba(255,255,255,0.18) !important; filter: brightness(1.12); }
.wp-trigger:disabled { opacity: 0.42; cursor: not-allowed; }

@keyframes wp-open {
  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.wp-dropdown { animation: wp-open 0.16s cubic-bezier(0.16,1,0.3,1); }

@media (max-width: 520px) {
  .wp-outer {
    right: 0 !important;
    bottom: 0 !important;
    left: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    border-radius: 18px 18px 0 0 !important;
    max-height: 72vh !important;
  }
}
`;

// ── Static data ────────────────────────────────────────────────────────────────

const CAT_ICON: Record<string, string> = {
  'Coupe':    '🏎',
  'Hatchback':'🚗',
  'Pickup':   '🛻',
  'Sedan':    '🚘',
  'SUV':      '🚐',
  'Truck':    '🚚',
  'Wagon':    '🚗',
};

interface Preset { label: string; config: WrapConfig; swatchStyle: React.CSSProperties }

const PRESETS: Preset[] = [
  {
    label:       'Matte Black',
    config:      { type: 'solid', color: '#1a1a1a' },
    swatchStyle: { background: '#1c1c1c' },
  },
  {
    label:       'Metallic Red',
    config:      { type: 'metallic', color: '#b91c1c' },
    swatchStyle: {
      background: 'radial-gradient(circle at 35% 30%, #f87171, #b91c1c 55%, #7f1d1d)',
    },
  },
  {
    label:       'Carbon Fiber',
    config:      { type: 'carbon' },
    swatchStyle: {
      background: '#181818',
      backgroundImage:
        'repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(255,255,255,0.04) 3px,rgba(255,255,255,0.04) 6px),' +
        'repeating-linear-gradient(-45deg,transparent,transparent 3px,rgba(255,255,255,0.04) 3px,rgba(255,255,255,0.04) 6px)',
    },
  },
];

const ENV_OPTIONS: { id: EnvironmentMode; icon: string; label: string }[] = [
  { id: 'garage', icon: '🏭', label: 'Garage' },
  { id: 'studio', icon: '💡', label: 'Studio' },
  { id: 'solid',  icon: '⬛', label: 'Dark'   },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt((hex.replace('#', '') + '000000').slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// ── Micro-components ──────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.11em',
      textTransform: 'uppercase', color: T.textMuted, marginBottom: '0.5rem',
    }}>
      {children}
    </div>
  );
}

function Sep() {
  return <div style={{ height: 1, background: T.divider, margin: '1rem 0' }} />;
}

// Chevron SVG
const Chevron = ({ open }: { open: boolean }) => (
  <svg
    width="10" height="6" viewBox="0 0 10 6" fill="none"
    style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', opacity: 0.45 }}
  >
    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Checkmark SVG
const Check = () => (
  <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
    <path d="M1 4l3 3 6-6" stroke={T.accent} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── VehicleDropdown ───────────────────────────────────────────────────────────
// Rendered as a portal to document.body so it escapes the panel's overflow scroll.

interface VehicleDropdownProps {
  selectedCarId: string;
  disabled:      boolean;
  onSelect:      (car: CarModel) => void;
}

function VehicleDropdown({ selectedCarId, disabled, onSelect }: VehicleDropdownProps) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; openUp: boolean }>({
    top: 0, left: 0, width: 0, openUp: false,
  });

  const triggerRef  = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCar = CAR_MODELS.find(c => c.id === selectedCarId);

  const toggleOpen = () => {
    if (disabled) return;
    if (open) { setOpen(false); return; }

    const r         = triggerRef.current!.getBoundingClientRect();
    const maxH      = 270;
    const spaceBelow = window.innerHeight - r.bottom - 6;
    const openUp    = spaceBelow < maxH && r.top > maxH;
    setRect({ top: openUp ? r.top - maxH - 4 : r.bottom + 4, left: r.left, width: r.width, openUp });
    setOpen(true);
  };

  // Click / pointer outside → close
  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open]);

  const pick = (car: CarModel) => { onSelect(car); setOpen(false); };

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={toggleOpen}
        disabled={disabled}
        className="wp-trigger"
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.6rem 0.75rem',
          background: open ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? T.borderHi : T.border}`,
          borderRadius: T.radius, color: T.text, fontSize: '13px', fontWeight: 500,
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '15px', lineHeight: 1, opacity: 0.75, flexShrink: 0 }}>
          {CAT_ICON[selectedCar?.category ?? ''] ?? '🚗'}
        </span>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedCar?.name ?? '—'}
        </span>
        <span style={{ fontSize: '10px', color: T.textMuted, flexShrink: 0, marginRight: '2px' }}>
          {selectedCar?.category}
        </span>
        <Chevron open={open} />
      </button>

      {/* Dropdown portal */}
      {open && createPortal(
        <div
          ref={dropdownRef}
          className="wp-dropdown wp-list"
          style={{
            position: 'fixed',
            top:  rect.top,
            left: rect.left,
            width: rect.width,
            maxHeight: 270,
            overflowY: 'auto',
            background: T.bgElevated,
            border: `1px solid ${T.border}`,
            borderRadius: '12px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
            zIndex: 9999,
            fontFamily: T.font,
            fontSize: '12.5px',
          }}
        >
          {Array.from(CAR_MODELS_BY_CATEGORY.entries()).map(([cat, cars]) => (
            <div key={cat}>
              {/* Sticky category header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 0.8rem 0.3rem',
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: T.textMuted,
                borderBottom: `1px solid ${T.divider}`,
                position: 'sticky', top: 0,
                background: T.bgElevated,
              }}>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>{CAT_ICON[cat] ?? '🚗'}</span>
                {cat}
              </div>

              {/* Car rows */}
              {cars.map(car => {
                const sel = car.id === selectedCarId;
                return (
                  <button
                    key={car.id}
                    onClick={() => pick(car)}
                    className="wp-car"
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 0.8rem',
                      background: sel ? T.accentDim : 'transparent',
                      border: 'none', color: sel ? T.accentText : T.text,
                      textAlign: 'left', fontFamily: T.font, fontSize: '12.5px',
                      fontWeight: sel ? 500 : 400,
                    }}
                  >
                    <span style={{ width: 14, height: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {sel && <Check />}
                    </span>
                    {car.name}
                  </button>
                );
              })}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}

// ── WrapPanel ─────────────────────────────────────────────────────────────────

interface WrapPanelProps {
  loading:          boolean;
  pickMode:         boolean;
  paintCount:       number;
  envMode:          EnvironmentMode;
  onSelectCar:      (car: CarModel) => void;
  onApplyWrap:      (config: WrapConfig) => void;
  onTogglePickMode: () => void;
  onClearPaintSet:  () => void;
  onSetEnvironment: (env: EnvironmentMode) => void;
}

const WrapPanel = ({
  loading, pickMode, paintCount, envMode,
  onSelectCar, onApplyWrap, onTogglePickMode, onClearPaintSet, onSetEnvironment,
}: WrapPanelProps) => {
  const [pickerColor,   setPickerColor]   = useState('#2563eb');
  const [selectedCarId, setSelectedCarId] = useState(DEFAULT_CAR_ID);

  const handleCarSelect = (car: CarModel) => {
    if (car.id === selectedCarId) return;
    setSelectedCarId(car.id);
    onSelectCar(car);
  };

  const wrapDisabled = loading || paintCount === 0;
  const [r, g, b]   = hexToRgb(pickerColor);

  return (
    <>
      {/* ── CSS injected as a real style element — only one in DOM ── */}
      <style>{STYLES}</style>

      <div
        className="wp-outer wp-panel"
        style={{
          position: 'fixed', bottom: '1.75rem', right: '1.75rem', zIndex: 20,
          width: '280px', maxHeight: 'calc(100vh - 3.5rem)',
          overflowY: 'auto', overflowX: 'hidden',
          background: T.bg,
          backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
          border: `1px solid ${T.border}`,
          borderRadius: '16px',
          boxShadow: '0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
          color: T.text, fontFamily: T.font, fontSize: '13px', userSelect: 'none',
        }}
      >
        <div style={{ padding: '1.15rem 1.15rem 1.3rem' }}>

          {/* ── Header ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {/* Status dot */}
              <div style={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                background: loading ? T.warning : pickMode ? T.success : T.accent,
                boxShadow: `0 0 7px ${loading ? T.warning : pickMode ? T.success : T.accent}88`,
                transition: 'background 0.3s, box-shadow 0.3s',
              }} />
              <div>
                <div style={{
                  fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: T.textMuted, lineHeight: 1,
                }}>
                  Wrap
                </div>
                <div style={{
                  fontSize: '15px', fontWeight: 700, letterSpacing: '-0.02em',
                  lineHeight: 1.15, marginTop: '1px', color: T.text,
                }}>
                  Studio
                </div>
              </div>
            </div>

            {loading && (
              <div style={{
                fontSize: '10px', fontWeight: 600, color: T.warning,
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: '99px', padding: '2px 9px',
                letterSpacing: '0.02em',
              }}>
                Loading…
              </div>
            )}
          </div>

          {/* ── Scene ── */}
          <Label>Scene</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
            {ENV_OPTIONS.map(({ id, icon, label }) => {
              const active = id === envMode;
              return (
                <button
                  key={id}
                  onClick={() => onSetEnvironment(id)}
                  className="wp-env"
                  style={{
                    padding: '0.5rem 0', lineHeight: 1,
                    background: active ? T.accentDim : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? T.accentBorder : T.border}`,
                    borderRadius: '9px',
                    color: active ? T.accentText : T.textSub,
                    fontSize: '11px', fontWeight: active ? 600 : 400,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '14px', marginBottom: '4px' }}>{icon}</div>
                  {label}
                </button>
              );
            })}
          </div>

          <Sep />

          {/* ── Vehicle ── */}
          <Label>Vehicle</Label>
          <VehicleDropdown
            selectedCarId={selectedCarId}
            disabled={loading}
            onSelect={handleCarSelect}
          />

          <Sep />

          {/* ── Paint Panels ── */}
          <Label>Paint Panels</Label>
          <div style={{ opacity: loading ? 0.42 : 1, pointerEvents: loading ? 'none' : undefined, transition: 'opacity 0.2s' }}>

            {/* Pick-mode toggle */}
            <button
              onClick={onTogglePickMode}
              className="wp-btn"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.55rem 0.75rem',
                background: pickMode ? T.successDim : 'rgba(255,255,255,0.04)',
                border: `1px solid ${pickMode ? T.successBorder : T.border}`,
                borderRadius: T.radius,
                color: pickMode ? T.successText : T.text,
                fontSize: '12.5px', fontWeight: 500, textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '14px', flexShrink: 0 }}>🖌</span>
              <span style={{ flex: 1 }}>
                {pickMode ? 'Picking — click a panel' : 'Pick panels'}
              </span>
              {paintCount > 0 && (
                <span style={{
                  background: 'rgba(59,130,246,0.2)',
                  border: '1px solid rgba(59,130,246,0.4)',
                  borderRadius: '99px', padding: '0 7px',
                  fontSize: '10.5px', lineHeight: '18px',
                  color: T.accentText, fontWeight: 700, flexShrink: 0,
                }}>
                  {paintCount}
                </span>
              )}
            </button>

            {pickMode && (
              <p style={{
                margin: '0.45rem 0 0', fontSize: '10.5px',
                color: T.textMuted, lineHeight: 1.55,
              }}>
                Click a panel to add or remove it. Drag to orbit.
              </p>
            )}

            {paintCount > 0 && (
              <button
                onClick={onClearPaintSet}
                className="wp-btn"
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.4rem', marginTop: '0.38rem', padding: '0.4rem',
                  background: 'transparent', border: `1px solid ${T.border}`,
                  borderRadius: T.radius, color: T.textMuted, fontSize: '11.5px',
                }}
              >
                {/* × icon */}
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M1 1l7 7M8 1l-7 7" stroke="currentColor"
                    strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Clear selection
              </button>
            )}
          </div>

          <Sep />

          {/* ── Wrap controls ── */}
          <div style={{
            opacity: wrapDisabled ? 0.36 : 1,
            pointerEvents: wrapDisabled ? 'none' : undefined,
            transition: 'opacity 0.2s',
          }}>
            {paintCount === 0 && !loading && (
              <p style={{ margin: '0 0 0.9rem', fontSize: '11px', color: T.textMuted, lineHeight: 1.6 }}>
                Select one or more panels above to apply a wrap.
              </p>
            )}

            {/* Custom color row */}
            <Label>Custom Color</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr', gap: '0.38rem' }}>

              {/* Native color picker hidden behind swatch */}
              <label style={{ display: 'block', position: 'relative', cursor: 'pointer', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{
                  width: '100%', height: 36, background: pickerColor,
                  border: `1px solid rgba(255,255,255,0.14)`,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.3)',
                  borderRadius: '8px',
                }} />
                <input
                  type="color" value={pickerColor} onChange={e => setPickerColor(e.target.value)}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                />
              </label>

              {/* Matte button — tinted to picker color */}
              <button
                onClick={() => onApplyWrap({ type: 'solid', color: pickerColor })}
                className="wp-btn"
                style={{
                  height: 36, padding: 0,
                  background: `rgba(${r},${g},${b},0.18)`,
                  border: `1px solid rgba(${r},${g},${b},0.35)`,
                  borderRadius: '8px',
                  color: T.text, fontSize: '12px', fontWeight: 600,
                }}
              >
                Matte
              </button>

              {/* Metallic button — lighter tint + small shine */}
              <button
                onClick={() => onApplyWrap({ type: 'metallic', color: pickerColor })}
                className="wp-btn"
                style={{
                  height: 36, padding: 0,
                  background: `linear-gradient(140deg, rgba(${Math.min(r+60,255)},${Math.min(g+60,255)},${Math.min(b+60,255)},0.28), rgba(${r},${g},${b},0.16))`,
                  border: `1px solid rgba(${r},${g},${b},0.3)`,
                  borderRadius: '8px',
                  color: T.text, fontSize: '12px', fontWeight: 600,
                }}
              >
                Metallic
              </button>
            </div>

            <Sep />

            {/* Presets */}
            <Label>Presets</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.32rem' }}>
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => onApplyWrap(p.config)}
                  className="wp-btn"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.7rem',
                    padding: '0.55rem 0.75rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${T.border}`,
                    borderRadius: T.radius,
                    color: T.text, fontSize: '12.5px', textAlign: 'left',
                  }}
                >
                  <span style={{
                    width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                    border: '1px solid rgba(255,255,255,0.13)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                    ...p.swatchStyle,
                  }} />
                  {p.label}
                </button>
              ))}
            </div>

            <Sep />

            {/* Reset */}
            <button
              onClick={() => onApplyWrap({ type: 'reset' })}
              className="wp-btn"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.45rem', padding: '0.48rem',
                background: 'transparent', border: `1px solid ${T.border}`,
                borderRadius: T.radius, color: T.textMuted, fontSize: '12px',
              }}
            >
              {/* Undo / reset icon */}
              <svg width="13" height="12" viewBox="0 0 13 12" fill="none">
                <path d="M2 6a4.5 4.5 0 1 0 .9-2.7" stroke="currentColor"
                  strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 2v3.5h3.5" stroke="currentColor"
                  strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Reset to Original
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default WrapPanel;
