import { useState } from 'react';
import { CAR_MODELS, CAR_MODELS_BY_CATEGORY, DEFAULT_CAR_ID, type CarModel } from '@/data/cars';
import type { WrapConfig, EnvironmentMode } from './ThreeScene';

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

const PRESETS: { label: string; swatch: string; config: WrapConfig }[] = [
  { label: 'Matte Black',  swatch: '#1a1a1a', config: { type: 'solid',    color: '#1a1a1a' } },
  { label: 'Metallic Red', swatch: '#b91c1c', config: { type: 'metallic', color: '#b91c1c' } },
  { label: 'Carbon Fiber', swatch: '#222222', config: { type: 'carbon' } },
];

const ENV_OPTIONS: { id: EnvironmentMode; icon: string; label: string }[] = [
  { id: 'garage', icon: '🏭', label: 'Garage' },
  { id: 'studio', icon: '💡', label: 'Studio' },
  { id: 'solid',  icon: '⬛', label: 'Dark'   },
];

// ── Style helpers ─────────────────────────────────────────────────────────────

const panel: React.CSSProperties = {
  position: 'fixed', bottom: '1.75rem', right: '1.75rem', zIndex: 20,
  width: '264px', padding: '1.25rem',
  background: 'rgba(8,8,10,0.82)', backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.09)', borderRadius: '14px',
  color: '#f0f0f0', fontFamily: 'system-ui,-apple-system,sans-serif',
  fontSize: '13px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', userSelect: 'none',
};

const sectionLabel: React.CSSProperties = {
  display: 'block', fontSize: '10px', fontWeight: 600,
  letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: '0.45rem',
};

const divider: React.CSSProperties = {
  height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.85rem 0',
};

const btn = (bg: string, border = 'rgba(255,255,255,0.1)', color = '#f0f0f0'): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
  padding: '0.45rem 0.7rem', background: bg,
  border: `1px solid ${border}`, borderRadius: '7px', color,
  fontSize: '12.5px', fontWeight: 500, cursor: 'pointer',
  textAlign: 'left', lineHeight: 1.25,
});

const dimmed: React.CSSProperties = { opacity: 0.45, pointerEvents: 'none' };

// ── Component ─────────────────────────────────────────────────────────────────

const WrapPanel = ({
  loading, pickMode, paintCount, envMode,
  onSelectCar, onApplyWrap, onTogglePickMode, onClearPaintSet, onSetEnvironment,
}: WrapPanelProps) => {
  const [pickerColor,   setPickerColor]   = useState('#2563eb');
  const [selectedCarId, setSelectedCarId] = useState(DEFAULT_CAR_ID);

  const handleCarChange = (id: string) => {
    const car = CAR_MODELS.find(c => c.id === id);
    if (!car || id === selectedCarId) return;
    setSelectedCarId(id);
    onSelectCar(car);
  };

  const wrapDisabled = loading || paintCount === 0;

  return (
    <div style={panel}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: loading ? '#f59e0b' : pickMode ? '#22c55e' : '#3b82f6',
            transition: 'background 0.25s',
          }} />
          <span style={{ fontWeight: 600, fontSize: '13px' }}>Wrap Studio</span>
        </div>
        {loading && <span style={{ fontSize: '11px', color: '#f59e0b' }}>Loading…</span>}
      </div>

      {/* ── Scene / Environment ── */}
      <span style={sectionLabel}>Scene</span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.3rem' }}>
        {ENV_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => onSetEnvironment(opt.id)}
            style={{
              padding: '0.4rem 0',
              background: envMode === opt.id ? 'rgba(59,130,246,0.22)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${envMode === opt.id ? 'rgba(59,130,246,0.55)' : 'rgba(255,255,255,0.09)'}`,
              borderRadius: '7px',
              color: envMode === opt.id ? '#93c5fd' : '#777',
              fontSize: '11px', fontWeight: envMode === opt.id ? 600 : 400,
              cursor: 'pointer', textAlign: 'center',
              transition: 'background 0.18s, border-color 0.18s, color 0.18s',
            }}
          >
            <div style={{ fontSize: '13px', marginBottom: '2px', lineHeight: 1 }}>{opt.icon}</div>
            {opt.label}
          </button>
        ))}
      </div>

      <div style={divider} />

      {/* ── Vehicle selector ── */}
      <span style={sectionLabel}>Vehicle</span>
      <select
        value={selectedCarId}
        onChange={e => handleCarChange(e.target.value)}
        disabled={loading}
        style={{
          width: '100%', padding: '0.45rem 0.6rem',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '7px', color: loading ? '#666' : '#f0f0f0',
          fontSize: '12.5px', cursor: loading ? 'not-allowed' : 'pointer',
          outline: 'none', appearance: 'auto',
        }}
      >
        {Array.from(CAR_MODELS_BY_CATEGORY.entries()).map(([cat, cars]) => (
          <optgroup key={cat} label={cat}>
            {cars.map(car => (
              <option key={car.id} value={car.id} style={{ background: '#1a1a1a' }}>
                {car.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <div style={divider} />

      {/* ── Paint-set / pick mode ── */}
      <span style={sectionLabel}>Paint Panels</span>

      <div style={loading ? dimmed : {}}>
        <button
          onClick={onTogglePickMode}
          style={btn(
            pickMode ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
            pickMode ? 'rgba(34,197,94,0.6)' : 'rgba(255,255,255,0.1)',
            pickMode ? '#86efac' : '#f0f0f0',
          )}
        >
          🖌
          <span style={{ flex: 1 }}>{pickMode ? 'Picking ON — click a panel' : 'Pick panels'}</span>
          {paintCount > 0 && (
            <span style={{
              background: 'rgba(59,130,246,0.25)', border: '1px solid rgba(59,130,246,0.5)',
              borderRadius: '10px', padding: '0 6px', fontSize: '11px',
              color: '#93c5fd', fontWeight: 700, flexShrink: 0,
            }}>
              {paintCount}
            </span>
          )}
        </button>

        {pickMode && (
          <p style={{ margin: '0.4rem 0 0', fontSize: '10.5px', color: '#666', lineHeight: 1.4 }}>
            Click a panel to add/remove it. Drag to orbit as usual.
          </p>
        )}

        {paintCount > 0 && (
          <button
            onClick={onClearPaintSet}
            style={{ ...btn('rgba(255,255,255,0.03)', 'rgba(255,255,255,0.07)', '#777'), marginTop: '0.35rem' }}
          >
            ✕  Clear selection
          </button>
        )}
      </div>

      <div style={divider} />

      {/* ── Wrap controls ── */}
      <div style={wrapDisabled ? dimmed : {}}>

        {paintCount === 0 && !loading && (
          <p style={{ margin: '0 0 0.7rem', fontSize: '11px', color: '#555', lineHeight: 1.4 }}>
            Select panels above to enable wrap controls.
          </p>
        )}

        <span style={sectionLabel}>Custom Color</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
          <label style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}>
            <div style={{
              width: '42px', height: '100%', minHeight: '34px', borderRadius: '7px',
              background: pickerColor, border: '1px solid rgba(255,255,255,0.15)', boxSizing: 'border-box',
            }} />
            <input
              type="color"
              value={pickerColor}
              onChange={e => setPickerColor(e.target.value)}
              style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer', width: '100%', height: '100%' }}
            />
          </label>
          <button
            onClick={() => onApplyWrap({ type: 'solid', color: pickerColor })}
            style={{ ...btn('rgba(37,99,235,0.25)', 'rgba(37,99,235,0.5)'), flex: 1, justifyContent: 'center' }}
          >
            Matte
          </button>
          <button
            onClick={() => onApplyWrap({ type: 'metallic', color: pickerColor })}
            style={{ ...btn('rgba(80,80,80,0.3)', 'rgba(180,180,180,0.2)'), flex: 1, justifyContent: 'center' }}
          >
            Metallic
          </button>
        </div>

        <div style={divider} />

        <span style={sectionLabel}>Presets</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.32rem' }}>
          {PRESETS.map(preset => (
            <button key={preset.label} onClick={() => onApplyWrap(preset.config)} style={btn('rgba(255,255,255,0.04)')}>
              <span style={{
                display: 'inline-block', width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                background: preset.swatch, border: '1px solid rgba(255,255,255,0.15)',
                backgroundImage: preset.config.type === 'carbon'
                  ? 'repeating-linear-gradient(45deg,#333 0,#333 2px,#111 2px,#111 6px)' : undefined,
              }} />
              {preset.label}
            </button>
          ))}
        </div>

        <div style={divider} />

        <button
          onClick={() => onApplyWrap({ type: 'reset' })}
          style={{ ...btn('rgba(255,255,255,0.03)', 'rgba(255,255,255,0.07)', '#777'), justifyContent: 'center' }}
        >
          ↺  Reset to Original
        </button>
      </div>

    </div>
  );
};

export default WrapPanel;
