import { T } from '../../styles/tokens'
import { Knop } from './Button'

// ── Kaart ──────────────────────────────────────────────────────────────────
export function Kaart({ kinderen, stijl, accentKleur }) {
  return (
    <div style={{
      background: T.bgCard,
      border: `1px solid ${T.border}`,
      borderRadius: T.radiusLg,
      borderTop: accentKleur ? `3px solid ${accentKleur}` : undefined,
      overflow: 'hidden',
      ...stijl,
    }}>
      {kinderen}
    </div>
  )
}

export function KaartLijf({ kinderen, stijl }) {
  return <div style={{ padding: '16px 18px', ...stijl }}>{kinderen}</div>
}

// ── Badge / Pill ────────────────────────────────────────────────────────────
export function Badge({ kinderen, kleur = T.textMuted, bg = T.bgPage, rand = T.border, klein }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: klein ? 10 : 11, fontWeight: 700,
      borderRadius: 20, padding: klein ? '1px 6px' : '2px 9px',
      color: kleur, background: bg, border: `1px solid ${rand}`,
      whiteSpace: 'nowrap',
    }}>
      {kinderen}
    </span>
  )
}

export function GezondheidsBadge({ gezondheid, klein }) {
  const MAP = {
    groen:  { label: 'Op schema',        kleur: T.green, bg: T.greenLight, rand: T.greenBorder },
    oranje: { label: 'Aandacht vereist', kleur: T.amber, bg: T.amberLight, rand: T.amberBorder },
    rood:   { label: 'Kritiek',          kleur: T.red,   bg: T.redLight,   rand: T.redBorder   },
  }
  const s = MAP[gezondheid] ?? MAP.groen
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.kleur, border: `1px solid ${s.rand}`,
      borderRadius: 20, padding: klein ? '2px 8px' : '4px 12px',
      fontSize: klein ? 11 : 12, fontWeight: 700,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.kleur }} />
      {s.label}
    </span>
  )
}

export function FaseBadge({ fase, klein }) {
  const FASE_KLEUREN = {
    'Ideeën':        { kleur: '#7C3AED', bg: '#F5F3FF', rand: '#DDD6FE' },
    'Inventarisatie':{ kleur: '#2563EB', bg: '#EFF6FF', rand: '#BFDBFE' },
    'Analyse':       { kleur: '#0891B2', bg: '#ECFEFF', rand: '#A5F3FC' },
    'Implementatie': { kleur: '#630D80', bg: '#EDE0F2', rand: '#D4B0E8' },
    'Nazorg':        { kleur: '#16A34A', bg: '#F0FDF4', rand: '#BBF7D0' },
    'Archief':       { kleur: '#6B7280', bg: '#F9FAFB', rand: '#E5E7EB' },
  }
  const s = FASE_KLEUREN[fase] ?? { kleur: T.textMuted, bg: T.bgPage, rand: T.border }
  return <Badge kleur={s.kleur} bg={s.bg} rand={s.rand} klein={klein}>{fase}</Badge>
}

// ── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ tekst = 'Laden…' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 40, color: T.textMuted }}>
      <div style={{
        width: 20, height: 20, border: `2px solid ${T.border}`,
        borderTop: `2px solid ${T.purple}`, borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: 13 }}>{tekst}</span>
    </div>
  )
}

// ── Invoerveld ───────────────────────────────────────────────────────────────
export function Invoer({ waarde, onChange, placeholder, type = 'text', stijl, meerdereRegels, rijen = 3 }) {
  const basisStijl = {
    background: T.bgPage, border: `1px solid ${T.borderMid}`, borderRadius: T.radiusSm,
    color: T.textPrimary, fontSize: 13, padding: '8px 12px',
    outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: T.fontBase,
  }
  if (meerdereRegels) {
    return <textarea value={waarde} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rijen} style={{ ...basisStijl, resize: 'vertical', ...stijl }} />
  }
  return <input type={type} value={waarde} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...basisStijl, ...stijl }} />
}

export function Selectie({ waarde, onChange, kinderen, stijl }) {
  return (
    <select value={waarde} onChange={e => onChange(e.target.value)} style={{
      background: T.bgPage, border: `1px solid ${T.borderMid}`, borderRadius: T.radiusSm,
      color: T.textPrimary, fontSize: 13, padding: '8px 12px',
      outline: 'none', cursor: 'pointer', fontFamily: T.fontBase, width: '100%', ...stijl,
    }}>
      {kinderen}
    </select>
  )
}

// ── Formulierrij ─────────────────────────────────────────────────────────────
export function FormRij({ label, kinderen, vereist }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textSecond, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}{vereist && <span style={{ color: T.red, marginLeft: 3 }}>*</span>}
      </div>
      {kinderen}
    </div>
  )
}

// ── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ titel, onSluiten, kinderen, breedte = 520 }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onSluiten()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10,4,20,0.5)', zIndex: 400,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div style={{
        background: T.bgCard, borderRadius: T.radiusLg, width: '100%', maxWidth: breedte,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(99,13,128,0.18)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: T.textPrimary }}>{titel}</span>
          <button onClick={onSluiten} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: 0 }}>×</button>
        </div>
        <div style={{ padding: 22 }}>{kinderen}</div>
      </div>
    </div>
  )
}

// ── Sectie-label ──────────────────────────────────────────────────────────────
export function SectieLabel({ kinderen, aantal, actie, opActie, kleur, stijl }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, ...stijl }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: kleur || T.textMuted }}>{kinderen}</span>
      {aantal > 0 && (
        <span style={{ fontSize: 10, fontWeight: 700, background: kleur || T.purple, color: '#fff', borderRadius: 10, padding: '0 6px', minWidth: 18, textAlign: 'center' }}>{aantal}</span>
      )}
      {actie && (
        <button onClick={opActie} style={{ marginLeft: 'auto', fontSize: 12, color: T.purple, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: T.fontBase }}>
          {actie}
        </button>
      )}
    </div>
  )
}

// ── Leeg scherm ───────────────────────────────────────────────────────────────
export function LeegScherm({ icoon = '○', tekst }) {
  return (
    <div style={{ padding: '12px 0', color: T.textMuted, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: T.green }}>✓</span> {tekst}
    </div>
  )
}
