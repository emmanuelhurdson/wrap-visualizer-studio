import { useState } from 'react';
import type { WrapConfig } from './ThreeScene';

interface WrapPanelProps {
  onApplyWrap: (config: WrapConfig) => void;
}

const PRESETS: { label: string; swatch: string; config: WrapConfig }[] = [
  {
    label:  'Matte Black',
    swatch: '#1a1a1a',
    config: { type: 'solid', color: '#1a1a1a' },
  },
  {
    label:  'Metallic Red',
    swatch: '#b91c1c',
    config: { type: 'metallic', color: '#b91c1c' },
  },
  {
    label:  'Carbon Fiber',
    swatch: '#222222',
    config: { type: 'carbon' },
  },
];

// ── Styles ────────────────────────────────────────────────────────────────────
// All inline so this panel is fully self-contained and works on any page.

const panel: React.CSSProperties = {
  position:        'fixed',
  bottom:          '1.75rem',
  right:           '1.75rem',
  zIndex:          20,
  width:           '252px',
  padding:         '1.25rem',
  background:      'rgba(8, 8, 10, 0.78)',
  backdropFilter:  'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border:          '1px solid rgba(255, 255, 255, 0.09)',
  borderRadius:    '14px',
  color:           '#f0f0f0',
  fontFamily:      'system-ui, -apple-system, sans-serif',
  fontSize:        '13px',
  boxShadow:       '0 8px 32px rgba(0,0,0,0.6)',
  userSelect:      'none',
};

const sectionLabel: React.CSSProperties = {
  display:        'block',
  fontSize:       '10px',
  fontWeight:     600,
  letterSpacing:  '0.1em',
  textTransform:  'uppercase',
  color:          '#666',
  marginBottom:   '0.5rem',
};

const divider: React.CSSProperties = {
  height:     '1px',
  background: 'rgba(255,255,255,0.06)',
  margin:     '0.85rem 0',
};

// Base button — we compose on top of this
const btn = (bg: string, border = 'rgba(255,255,255,0.1)'): React.CSSProperties => ({
  display:        'flex',
  alignItems:     'center',
  gap:            '0.5rem',
  width:          '100%',
  padding:        '0.5rem 0.7rem',
  background:     bg,
  border:         `1px solid ${border}`,
  borderRadius:   '8px',
  color:          '#f0f0f0',
  fontSize:       '12.5px',
  fontWeight:     500,
  cursor:         'pointer',
  textAlign:      'left',
  lineHeight:     1.2,
  transition:     'background 0.15s',
});

// ── Component ─────────────────────────────────────────────────────────────────
const WrapPanel = ({ onApplyWrap }: WrapPanelProps) => {
  const [pickerColor, setPickerColor] = useState('#2563eb');

  return (
    <div style={panel}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
        <span style={{ fontWeight: 600, fontSize: '13px', letterSpacing: '0.02em' }}>
          Wrap Studio
        </span>
      </div>

      {/* ── Custom color ── */}
      <span style={sectionLabel}>Custom Color</span>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>

        {/* Native color picker — opens OS color dialog */}
        <label style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}>
          <div style={{
            width:        '42px',
            height:       '100%',
            minHeight:    '34px',
            borderRadius: '8px',
            background:   pickerColor,
            border:       '1px solid rgba(255,255,255,0.15)',
            boxSizing:    'border-box',
          }} />
          <input
            type="color"
            value={pickerColor}
            onChange={(e) => setPickerColor(e.target.value)}
            style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer', width: '100%', height: '100%' }}
          />
        </label>

        <button
          onClick={() => onApplyWrap({ type: 'solid', color: pickerColor })}
          style={{ ...btn('rgba(37,99,235,0.25)', 'rgba(37,99,235,0.5)'), flex: 1, justifyContent: 'center' }}
        >
          Apply Matte
        </button>

        <button
          onClick={() => onApplyWrap({ type: 'metallic', color: pickerColor })}
          style={{ ...btn('rgba(80,80,80,0.3)', 'rgba(180,180,180,0.2)'), flex: 1, justifyContent: 'center' }}
        >
          Metallic
        </button>
      </div>

      <div style={divider} />

      {/* ── Presets ── */}
      <span style={sectionLabel}>Presets</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onApplyWrap(preset.config)}
            style={btn('rgba(255,255,255,0.04)')}
          >
            {/* Color swatch */}
            <span style={{
              display:      'inline-block',
              width:        '14px',
              height:       '14px',
              borderRadius: '3px',
              background:   preset.swatch,
              flexShrink:   0,
              border:       '1px solid rgba(255,255,255,0.15)',
              // Carbon swatch gets a diagonal stripe pattern
              backgroundImage: preset.config.type === 'carbon'
                ? 'repeating-linear-gradient(45deg,#333 0,#333 2px,#111 2px,#111 6px)'
                : undefined,
            }} />
            {preset.label}
          </button>
        ))}
      </div>

      <div style={divider} />

      {/* ── Reset ── */}
      <button
        onClick={() => onApplyWrap({ type: 'reset' })}
        style={{
          ...btn('rgba(255,255,255,0.03)', 'rgba(255,255,255,0.07)'),
          justifyContent: 'center',
          color:          '#888',
        }}
      >
        ↺  Reset to Original
      </button>

    </div>
  );
};

export default WrapPanel;
